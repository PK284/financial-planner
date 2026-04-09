
import sys

def count_tags(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    depth = 0
    for i, line in enumerate(lines):
        opens = line.count('<') - line.count('</') - line.count('/>')
        # This is a bit naive but helpful
        # Better: specifically look for tags
        open_tags = line.count('<div') + line.count('<header') + line.count('<button') + line.count('<span') + line.count('<input') + line.count('<select') + line.count('<table') + line.count('<thead') + line.count('<tbody') + line.count('<tr') + line.count('<th') + line.count('<td') + line.count('<Slider') + line.count('<PieChart') + line.count('<Bar') + line.count('<>')
        close_tags = line.count('</div') + line.count('</header') + line.count('</button') + line.count('</span') + line.count('</input') + line.count('</select') + line.count('</table') + line.count('</thead') + line.count('</tbody') + line.count('</tr') + line.count('</th') + line.count('</td') + line.count('</Slider') + line.count('</PieChart') + line.count('</Bar') + line.count('</>')
        
        # Self closing
        self_closing = line.count('/>')
        
        depth += (open_tags - close_tags - self_closing)
        if depth < 0:
            print(f"Mismatch at line {i+1}: depth {depth}")
            print(line)
            # break
    print(f"Final depth: {depth}")

count_tags(sys.argv[1])
