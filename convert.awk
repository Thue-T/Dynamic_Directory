BEGIN {
    in_code_block = 0
    in_table = 0
    print "<!DOCTYPE html>"
    print "<html lang=\"en\">
    print "<head>"
    print "    <meta charset=\"UTF-8\">
    print "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    print "    <title>Comprehensive Discovery Agent Report</title>"
    print "    <style>"
    print "        body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }"
    print "        h1, h2, h3 { color: #2c3e50; }"
    print "        pre { background-color: #f4f4f4; padding: 1em; border-radius: 5px; overflow-x: auto; }"
    print "        code { font-family: monospace; }"
    print "        table { border-collapse: collapse; width: 100%; }"
    print "        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }"
    print "        th { background-color: #f2f2f2; }"
    print "    </style>"
    print "</head>"
    print "<body>"
}

# Code blocks
/^
```
/ {
    if (in_code_block) {
        print "</pre>"
        in_code_block = 0
    } else {
        print "<pre>"
        in_code_block = 1
    }
    next
}
in_code_block {
    gsub(/&/, "\\&amp;")
    gsub(/</, "\\&lt;")
    gsub(/>/, "\\&gt;")
    print
    next
}

# Headings
/^# / { print "<h1>" substr($0, 3) "</h1>"; next }
/^## / { print "<h2>" substr($0, 4) "</h2>"; next }
/^### / { print "<h3>" substr($0, 5) "</h3>"; next }

# Horizontal Rule
/^---
/ { print "<hr>"; next }

# List items
/^\* / { print "<ul><li>" substr($0, 3) "</li></ul>"; next }

# Links
{
    gsub(/\\\[([^\]]+)\]\(([^)]+)\)/, "<a href=\"\\2\">\\1</a>")
}

# Bold
{
    gsub(/\*\*([^
*]+)\*\*/, "<strong>\\1</strong>")
}

# Tables
/^\|.*\|$/ {
    if (!in_table) {
        print "<table>"
        in_table = 1
    }
    line = $0
    gsub(/^\||\|$/, "", line)
    print "<tr>"
    n = split(line, cells, "|")
    for (i = 1; i <= n; i++) {
        # Check if it is a header row
        if (NR == 1 || last_line ~ /^\|-/)
             print "<th>" cells[i] "</th>"
        else
             print "<td>" cells[i] "</td>"
        
    }
    print "</tr>"
    last_line = $0
    next
}
{
    if (in_table) {
        print "</table>"
        in_table = 0
    }
}

# Numbered lists
/^[0-9]+\. / {
    if (!in_ol) {
        print "<ol>"
        in_ol = 1
    }
    print "<li>" substr($0, 4) "</li>"
    next
}
{
    if (in_ol) {
        print "</ol>"
        in_ol = 0
    }
}


# Paragraphs
NF { print "<p>" $0 "</p>" }

END {
    print "</body>"
    print "</html>"
}
