/**
 * Search module for Danish Producer Directory
 * Handles search queries, API calls, and result rendering
 */

const Search = {
  currentResults: [],
  currentPage: 0,
  isSearching: false,

  /**
   * Perform a search
   */
  async search(query, options = {}) {
    if (this.isSearching) return;
    if (query.length < CONFIG.search.minQueryLength) {
      this.showToast('Please enter at least 3 characters');
      return;
    }

    this.isSearching = true;
    this.currentPage = 0;
    this.showLoading();

    try {
      // Get filter values
      const filters = Filters.getValues();
      const location = document.getElementById('location')?.value || null;
      const distance = document.getElementById('distance')?.value || null;

      // Build search request
      const searchRequest = {
        query,
        filters,
        location,
        distance: distance ? parseInt(distance) : null,
        page: this.currentPage,
        limit: CONFIG.search.maxResults
      };

      // Track search
      Storage.addSearchHistory({ query, filters, location, distance });
      Storage.trackSearch(query, filters, 0);

      // Perform search
      let results;
      if (CONFIG.dev.useMockData || !CONFIG.api.baseUrl) {
        results = await this.mockSearch(searchRequest);
      } else {
        results = await this.apiSearch(searchRequest);
      }

      this.currentResults = results.companies || [];

      // Update analytics with result count
      Storage.trackSearch(query, filters, this.currentResults.length);

      // Discover new parameters from results
      this.currentResults.forEach(company => {
        Filters.discoverFromCompanyData(company);
      });

      // Render results
      this.renderResults(this.currentResults);

    } catch (error) {
      console.error('Search error:', error);
      this.showError('Search failed. Please try again.');
    } finally {
      this.isSearching = false;
      this.hideLoading();
    }
  },

  /**
   * API search (when backend is ready)
   */
  async apiSearch(request) {
    const response = await fetch(`${CONFIG.api.baseUrl}${CONFIG.api.searchEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request),
      timeout: CONFIG.api.timeout
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Mock search for development/testing
   * Uses DataLoader to get real company data from JSON files
   */
  async mockSearch(request) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get companies from DataLoader (real data from JSON) or fall back to mock
    const companies = DataLoader.getCompanies();
    const mockCompanies = companies.length > 0 ? companies : this.getMockCompanies();

    // Simple text matching for demo
    const query = request.query.toLowerCase();
    const filtered = mockCompanies.filter(company => {
      const searchText = [
        company.name,
        company.description,
        ...(company.capabilities?.processes || []),
        ...(company.capabilities?.materials || []),
        ...(company.certifications || [])
      ].join(' ').toLowerCase();

      return searchText.includes(query);
    });

    // Apply distance filter if provided
    let results = filtered;
    if (request.location && request.distance) {
      // In real implementation, this would use geocoding
      // For now, just return all results
      results = filtered;
    }

    // Calculate match scores (simplified)
    results = results.map(company => ({
      ...company,
      matchScore: this.calculateMatchScore(company, request.query)
    })).sort((a, b) => b.matchScore - a.matchScore);

    return {
      companies: results,
      total: results.length,
      page: request.page
    };
  },

  /**
   * Calculate a match score for ranking
   */
  calculateMatchScore(company, query) {
    let score = 0;
    const queryWords = query.toLowerCase().split(/\s+/);
    const searchableText = [
      company.name,
      company.description,
      ...(company.capabilities?.processes || []),
      ...(company.capabilities?.materials || [])
    ].join(' ').toLowerCase();

    queryWords.forEach(word => {
      if (searchableText.includes(word)) {
        score += 20;
        // Bonus for exact matches in name
        if (company.name.toLowerCase().includes(word)) {
          score += 10;
        }
      }
    });

    // Bonus for certifications
    if (company.certifications?.length > 0) {
      score += company.certifications.length * 5;
    }

    return Math.min(score, 100);
  },

  /**
   * Get mock company data for testing
   */
  getMockCompanies() {
    return [
      {
        id: 'mock-001',
        cvr: '12345678',
        name: 'Nordic Steel Works A/S',
        description: 'Specialist in heavy steel fabrication, welding, and custom metal structures.',
        address: {
          street: 'Industrivej 42',
          city: 'Odense',
          postalCode: '5000',
          country: 'Denmark'
        },
        website: 'https://nordicsteelworks.dk',
        phone: '+45 65 12 34 56',
        email: 'info@nordicsteelworks.dk',
        capabilities: {
          processes: ['Welding', 'Cutting', 'Bending', 'Assembly'],
          welding: {
            maxThickness: 50,
            minThickness: 1,
            types: ['MIG', 'TIG', 'Stick']
          },
          cutting: {
            types: ['Laser', 'Plasma'],
            maxThickness: 30
          },
          materials: ['Carbon Steel', 'Stainless Steel', 'Aluminum']
        },
        certifications: ['ISO 9001', 'EN 1090-2'],
        employees: '50-100',
        founded: 1985
      },
      {
        id: 'mock-002',
        cvr: '23456789',
        name: 'Copenhagen Pipe Solutions ApS',
        description: 'Leading manufacturer of industrial pipes and fittings for process industries.',
        address: {
          street: 'Rørvej 15',
          city: 'København',
          postalCode: '2300',
          country: 'Denmark'
        },
        website: 'https://cph-pipes.dk',
        phone: '+45 32 98 76 54',
        email: 'sales@cph-pipes.dk',
        capabilities: {
          processes: ['Pipe Fabrication', 'Welding', 'Threading', 'Coating'],
          pipes: {
            minDiameter: 10,
            maxDiameter: 1000,
            materials: ['Carbon Steel', 'Stainless Steel', 'Duplex']
          },
          welding: {
            maxThickness: 40,
            types: ['TIG', 'Orbital']
          },
          materials: ['Carbon Steel', 'Stainless Steel 316L', 'Duplex 2205']
        },
        certifications: ['ISO 9001', 'ISO 3834-2', 'PED'],
        employees: '25-50',
        founded: 1998
      },
      {
        id: 'mock-003',
        cvr: '34567890',
        name: 'Aalborg Metal Teknik',
        description: 'CNC machining and precision metal fabrication for industrial applications.',
        address: {
          street: 'Metalvænget 8',
          city: 'Aalborg',
          postalCode: '9000',
          country: 'Denmark'
        },
        website: 'https://aalborg-metal.dk',
        phone: '+45 98 12 34 56',
        email: 'kontakt@aalborg-metal.dk',
        capabilities: {
          processes: ['CNC Machining', 'Milling', 'Turning', 'Grinding'],
          machining: {
            maxLength: 2000,
            maxDiameter: 500,
            tolerance: 0.01
          },
          materials: ['Steel', 'Stainless Steel', 'Aluminum', 'Brass', 'Titanium']
        },
        certifications: ['ISO 9001', 'AS9100'],
        employees: '10-25',
        founded: 2005
      },
      {
        id: 'mock-004',
        cvr: '45678901',
        name: 'Jysk Laser Cutting A/S',
        description: 'High-precision laser and waterjet cutting services for all metals.',
        address: {
          street: 'Skærevej 22',
          city: 'Vejle',
          postalCode: '7100',
          country: 'Denmark'
        },
        website: 'https://jysklaser.dk',
        phone: '+45 75 82 34 56',
        email: 'ordre@jysklaser.dk',
        capabilities: {
          processes: ['Laser Cutting', 'Waterjet Cutting', 'Bending'],
          cutting: {
            types: ['Fiber Laser', 'CO2 Laser', 'Waterjet'],
            maxThickness: 25,
            bedSize: { width: 3000, length: 6000 }
          },
          bending: {
            maxLength: 4000,
            maxThickness: 15
          },
          materials: ['Carbon Steel', 'Stainless Steel', 'Aluminum', 'Copper', 'Brass']
        },
        certifications: ['ISO 9001'],
        employees: '25-50',
        founded: 2010
      }
    ];
  },

  /**
   * Render search results
   */
  renderResults(companies) {
    const container = document.getElementById('results-container');
    const section = document.getElementById('results-section');
    const countSpan = document.querySelector('#results-count span');

    if (!container || !section) return;

    // Update count
    if (countSpan) {
      countSpan.textContent = companies.length;
    }

    // Show results section
    section.style.display = 'block';

    // Smooth scroll to results
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (companies.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <p>No producers found matching your search.</p>
          <p><small>Try adjusting your search terms or removing filters.</small></p>
        </div>
      `;
      return;
    }

    container.innerHTML = companies.map(company => this.renderCompanyCard(company)).join('');

    // Attach click listeners
    container.querySelectorAll('.result-card').forEach(card => {
      card.addEventListener('click', () => {
        const companyId = card.dataset.companyId;
        const company = this.currentResults.find(c => c.id === companyId);
        if (company) {
          Storage.trackClick(companyId, document.getElementById('search-query')?.value);
          this.showCompanyModal(company);
        }
      });
    });
  },

  /**
   * Render a single company card
   */
  renderCompanyCard(company) {
    const capabilities = company.capabilities?.processes?.slice(0, 4) || [];
    const location = company.address ? `${company.address.city}, ${company.address.country}` : '';

    return `
      <article class="result-card" data-company-id="${company.id}">
        <h3>${this.escapeHtml(company.name)}</h3>
        <p class="company-meta">
          ${location ? `<span>${location}</span>` : ''}
          ${company.employees ? ` • ${company.employees} employees` : ''}
        </p>
        <p>${this.escapeHtml(company.description?.substring(0, 150))}${company.description?.length > 150 ? '...' : ''}</p>
        <div class="company-capabilities">
          ${capabilities.map(cap => `<span class="capability-tag">${this.escapeHtml(cap)}</span>`).join('')}
        </div>
        ${company.matchScore ? `<p class="match-score">Match: <strong>${company.matchScore}%</strong></p>` : ''}
      </article>
    `;
  },

  /**
   * Show company detail modal
   */
  showCompanyModal(company) {
    const modal = document.getElementById('company-modal');
    const nameEl = document.getElementById('modal-company-name');
    const contentEl = document.getElementById('modal-content');
    const contactBtn = document.getElementById('modal-contact-btn');

    if (!modal || !nameEl || !contentEl) return;

    nameEl.textContent = company.name;

    contentEl.innerHTML = `
      <div class="modal-section">
        <h4>About</h4>
        <p>${this.escapeHtml(company.description || 'No description available.')}</p>
      </div>

      ${company.address ? `
        <div class="modal-section">
          <h4>Location</h4>
          <p>
            ${company.address.street}<br>
            ${company.address.postalCode} ${company.address.city}<br>
            ${company.address.country}
          </p>
        </div>
      ` : ''}

      ${company.capabilities ? `
        <div class="modal-section">
          <h4>Capabilities</h4>
          <ul class="capability-list">
            ${company.capabilities.processes?.map(p => `<li>${this.escapeHtml(p)}</li>`).join('') || ''}
          </ul>
          ${company.capabilities.materials ? `
            <p><strong>Materials:</strong> ${company.capabilities.materials.join(', ')}</p>
          ` : ''}
        </div>
      ` : ''}

      ${company.certifications?.length > 0 ? `
        <div class="modal-section">
          <h4>Certifications</h4>
          <p>${company.certifications.join(', ')}</p>
        </div>
      ` : ''}

      <div class="modal-section">
        <h4>Contact</h4>
        <p>
          ${company.phone ? `Phone: ${company.phone}<br>` : ''}
          ${company.email ? `Email: ${company.email}<br>` : ''}
          ${company.website ? `Website: <a href="${company.website}" target="_blank">${company.website}</a>` : ''}
        </p>
      </div>
    `;

    // Contact button handler
    if (contactBtn) {
      contactBtn.onclick = () => {
        Storage.trackContact(company.id, company.capabilities);
        if (company.email) {
          window.location.href = `mailto:${company.email}?subject=Inquiry from Danish Producer Directory`;
        } else if (company.website) {
          window.open(company.website, '_blank');
        }
        this.showToast('Contact tracked - thank you!');
      };
    }

    modal.showModal();
  },

  /**
   * Show loading state
   */
  showLoading() {
    const btn = document.getElementById('search-btn');
    const container = document.getElementById('results-container');
    const section = document.getElementById('results-section');

    if (btn) btn.setAttribute('aria-busy', 'true');

    if (container && section) {
      section.style.display = 'block';
      container.innerHTML = `
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
      `;
    }
  },

  /**
   * Hide loading state
   */
  hideLoading() {
    const btn = document.getElementById('search-btn');
    if (btn) btn.removeAttribute('aria-busy');
  },

  /**
   * Show error message
   */
  showError(message) {
    const container = document.getElementById('results-container');
    if (container) {
      container.innerHTML = `
        <div class="no-results">
          <p>${this.escapeHtml(message)}</p>
        </div>
      `;
    }
  },

  /**
   * Show toast notification
   */
  showToast(message) {
    const toast = document.getElementById('feedback-toast');
    const messageEl = document.getElementById('toast-message');

    if (!toast || !messageEl) return;

    messageEl.textContent = message;
    toast.style.display = 'block';

    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
