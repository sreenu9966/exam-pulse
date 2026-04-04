import os

file_path = r"c:\Users\C H SREENU\EXAM_PLUSE\exam-pulse\Exam_Pluse\frontend\src\features\admin\AdminDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip_until = None

for i, line in enumerate(lines):
    line_num = i + 1
    
    # 1. Fix the Header Nesting (approx 2858)
    if "color: \"var(--accent)\" }}>                         <div style={{ display: \"flex\", alignItems: \"center\"" in line:
        new_lines.append(line.replace("color: \"var(--accent)\" }}>                         <div style", " }}> <div style").replace("<h3", "<div"))
        continue
    
    if line_num == 2871 and line.strip() == "</h3>":
        new_lines.append("                         </div>\n") # Replace closing h3 with div
        continue

    # 2. Fix the Ternary Wrapper/Fragment
    if line_num == 2855 and ") : (" in line:
        new_lines.append(line.replace(") : (", ") : (\n                    <div style={{ position: 'relative' }}>"))
        continue

    # 3. Handle the Toolbar close and Ternary End (approx 3081 in current corrupted version)
    if line_num == 3081 and "</div>" in line:
        # Check if this is the one closing the toolbar or the wrapper
        new_lines.append(line)
        new_lines.append("                    </div>\n") # This is the wrapper close
        continue

    new_lines.append(line)

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Surgical repair complete.")
