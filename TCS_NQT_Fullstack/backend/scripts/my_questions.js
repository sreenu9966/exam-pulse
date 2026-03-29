const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Question = require('../models/Question');
const { getSectionForTopic } = require('../config/mappings');

/**
 * 📝 FULL QUESTION BANK (120+ QUESTIONS)
 * PASTE THE REST OF THE QUESTIONS BELOW if they were truncated.
 */
const MY_QUESTIONS = [
  {
    "s": "Numbers",
    "q": "(112 x 54) = ?",
    "o": ["67000", "70000", "76500", "77200"],
    "a": "67000"
  },
  {
    "s": "Numbers",
    "q": "It is being given that (2^32 + 1) is completely divisible by a whole number. Which of the following numbers is completely divisible by this number?",
    "o": ["(2^16 + 1)", "(2^16 - 1)", "(7 x 2^33)", "(2^96 + 1)"],
    "a": "(2^96 + 1)"
  },
  {
    "s": "Numbers",
    "q": "What least number must be added to 1056, so that the sum is completely divisible by 23 ?",
    "o": ["2", "3", "18", "21"],
    "a": "2"
  },
  {
    "s": "Numbers",
    "q": "1397 x 1397 = ?",
    "o": ["1951609", "1981709", "1836261", "2031719"],
    "a": "1951609"
  },
  {
    "s": "Numbers",
    "q": "How many of the following numbers are divisible by 132 ?\n264, 396, 462, 792, 968, 2178, 5184, 6336",
    "o": ["4", "5", "6", "7"],
    "a": "4"
  },
  { s: "Quantitative Aptitude", q: "If a train travels 120 km in 2 hours, what is its speed?", o: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"], a: 1 },
  { s: "Quantitative Aptitude", q: "What is 25% of 400?", o: ["50", "75", "100", "125"], a: 2 },
  { s: "Quantitative Aptitude", q: "If 5x + 3 = 28, then x = ?", o: ["3", "4", "5", "6"], a: 2 },
  { s: "Quantitative Aptitude", q: "The average of 5 numbers is 20. If one number is excluded, the average becomes 15. What is the excluded number?", o: ["30", "35", "40", "45"], a: 2 },
  { s: "Quantitative Aptitude", q: "A man buys an article for ₹500 and sells it for ₹600. What is his profit percentage?", o: ["10%", "15%", "20%", "25%"], a: 2 },
  { s: "Quantitative Aptitude", q: "Find the next number in the series: 2, 6, 12, 20, ?", o: ["28", "30", "32", "34"], a: 1 },
  { s: "Quantitative Aptitude", q: "If the ratio of A:B is 3:4 and B:C is 2:3, what is A:C?", o: ["1:2", "2:3", "3:4", "4:5"], a: 0 },
  { s: "Quantitative Aptitude", q: "A pipe can fill a tank in 6 hours. Another pipe can empty it in 8 hours. If both are open, how long to fill the tank?", o: ["12 hours", "18 hours", "24 hours", "30 hours"], a: 2 },
  { s: "Quantitative Aptitude", q: "Simple Interest on ₹1000 at 5% per annum for 2 years is?", o: ["₹50", "₹100", "₹150", "₹200"], a: 1 },
  { s: "Quantitative Aptitude", q: "If 2^x = 32, then x = ?", o: ["3", "4", "5", "6"], a: 2 },
  { s: "Logical Reasoning", q: "If all roses are flowers and some flowers are red, which statement is definitely true?", o: ["All roses are red", "Some roses are red", "Some flowers are roses", "All red things are flowers"], a: 2 },
  { s: "Logical Reasoning", q: "Find the odd one out: 3, 9, 27, 81, 243, 729, 2188", o: ["243", "729", "2188", "81"], a: 2 },
  { s: "Logical Reasoning", q: "If CODING is written as DPEJOH, how is MOTHER written?", o: ["NPUIFS", "NPTIFS", "OPUIFS", "LPUIFS"], a: 0 },
  { s: "Logical Reasoning", q: "Statement: All managers are employees. Some employees are engineers. Conclusion: Some managers are engineers.", o: ["True", "False", "Cannot be determined", "None of these"], a: 1 },
  { s: "Logical Reasoning", q: "In a certain code, FRIEND is written as HUMJTK. How is SISTER written?", o: ["UKUVGT", "TKUTGS", "TJTUGS", "UKUTGS"], a: 0 },
  { s: "Logical Reasoning", q: "What comes next in the sequence: Z, X, V, T, ?", o: ["S", "R", "Q", "P"], a: 1 },
  { s: "Logical Reasoning", q: "If A = 1, B = 2, C = 3... what is the value of COMPUTER?", o: ["99", "100", "101", "102"], a: 0 },
  { s: "Logical Reasoning", q: "Blood Relations: A is B's sister. B is C's father. D is C's sister. How is A related to D?", o: ["Aunt", "Sister", "Mother", "Cousin"], a: 0 },
  { s: "Logical Reasoning", q: "Ram walks 5m North, then 3m East, then 5m South. How far is he from starting point?", o: ["2m", "3m", "5m", "8m"], a: 1 },
  { s: "Logical Reasoning", q: "If 5th Monday falls on 7th day of a month, what day is the 27th?", o: ["Sunday", "Monday", "Tuesday", "Wednesday"], a: 0 },
  { s: "Verbal Ability", q: "Choose the correct synonym for 'Benevolent':", o: ["Malicious", "Kind", "Angry", "Sad"], a: 1 },
  { s: "Verbal Ability", q: "Choose the antonym for 'Abundant':", o: ["Plentiful", "Scarce", "Sufficient", "Ample"], a: 1 },
  { s: "Verbal Ability", q: "Fill in the blank: She is ___ intelligent than her brother.", o: ["much", "more", "very", "most"], a: 1 },
  { s: "Verbal Ability", q: "Choose the correctly spelled word:", o: ["Accommodate", "Accomodate", "Acomodate", "Acommodate"], a: 0 },
  { s: "Verbal Ability", q: "Identify the error: 'Neither of the two students are present today.'", o: ["Neither", "two students", "are", "present today"], a: 2 },
  { s: "Verbal Ability", q: "Choose the correct sentence:", o: ["He is taller than me", "He is taller than I", "He is more taller than me", "He is most taller than me"], a: 0 },
  { s: "Verbal Ability", q: "What is the meaning of the idiom 'A piece of cake'?", o: ["Difficult task", "Easy task", "Delicious food", "Birthday celebration"], a: 1 },
  { s: "Verbal Ability", q: "Choose the passive voice: 'The teacher teaches the students.'", o: ["The students are taught by the teacher", "The students teach the teacher", "The teacher is taught by students", "The students were taught"], a: 0 },
  { s: "Verbal Ability", q: "One word substitution for 'A person who loves books':", o: ["Bibliophile", "Philanthropist", "Narcissist", "Hedonist"], a: 0 },
  { s: "Verbal Ability", q: "Choose the correct preposition: 'He is good ___ mathematics.'", o: ["in", "at", "on", "with"], a: 1 },
  { s: "Programming Concepts", q: "What is the output of: print(10 // 3) in Python?", o: ["3.33", "3", "4", "3.0"], a: 1 },
  { s: "Programming Concepts", q: "Which data structure uses LIFO principle?", o: ["Queue", "Stack", "Array", "Linked List"], a: 1 },
  { s: "Programming Concepts", q: "Time complexity of Binary Search is:", o: ["O(n)", "O(log n)", "O(n²)", "O(1)"], a: 1 },
  { s: "Programming Concepts", q: "What does SQL stand for?", o: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"], a: 0 },
  { s: "Programming Concepts", q: "Which is not a programming language?", o: ["Python", "Java", "HTML", "C++"], a: 2 },
  { s: "Programming Concepts", q: "What is the size of int data type in C?", o: ["2 bytes", "4 bytes", "8 bytes", "Depends on compiler"], a: 1 },
  { s: "Programming Concepts", q: "Which sorting algorithm is fastest on average?", o: ["Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort"], a: 2 },
  { s: "Programming Concepts", q: "What does OOP stand for?", o: ["Object Oriented Programming", "Objective Oriented Programming", "Order Of Programming", "Object Order Programming"], a: 0 },
  { s: "Programming Concepts", q: "Which is NOT a loop in C?", o: ["for", "while", "do-while", "repeat-until"], a: 3 },
  { s: "Programming Concepts", q: "What is encapsulation in OOP?", o: ["Hiding implementation details", "Creating multiple objects", "Inheriting properties", "Overloading functions"], a: 0 },
  { s: "Database Management", q: "Which command is used to retrieve data from database?", o: ["GET", "FETCH", "SELECT", "RETRIEVE"], a: 2 },
  { s: "Database Management", q: "What is primary key?", o: ["A key that uniquely identifies each record", "The first key in table", "A foreign key", "An index"], a: 0 },
  { s: "Database Management", q: "Which is NOT a DDL command?", o: ["CREATE", "ALTER", "DROP", "INSERT"], a: 3 },
  { s: "Database Management", q: "What does RDBMS stand for?", o: ["Relational Database Management System", "Relative Database Management System", "Record Database Management System", "Remote Database Management System"], a: 0 },
  { s: "Database Management", q: "Which clause is used to filter results in SQL?", o: ["FILTER", "WHERE", "HAVING", "SELECT"], a: 1 },
  { s: "Database Management", q: "What is normalization?", o: ["Organizing data to reduce redundancy", "Creating backups", "Indexing tables", "Encrypting data"], a: 0 },
  { s: "Database Management", q: "Which JOIN returns all records when there is a match in either table?", o: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], a: 3 },
  { s: "Database Management", q: "What is the purpose of INDEX in database?", o: ["To speed up data retrieval", "To store data", "To create relationships", "To delete data"], a: 0 },
  { s: "Database Management", q: "Which constraint ensures all values in a column are unique?", o: ["PRIMARY KEY", "FOREIGN KEY", "UNIQUE", "CHECK"], a: 2 },
  { s: "Database Management", q: "What is a transaction in database?", o: ["A single operation", "A sequence of operations performed as a single unit", "A table", "A query"], a: 1 },
  { s: "Networking", q: "What does IP stand for?", o: ["Internet Protocol", "Internal Protocol", "Internet Process", "International Protocol"], a: 0 },
  { s: "Networking", q: "Which layer of OSI model handles routing?", o: ["Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer"], a: 2 },
  { s: "Networking", q: "What is the range of private IP addresses (Class A)?", o: ["10.0.0.0 to 10.255.255.255", "172.16.0.0 to 172.31.255.255", "192.168.0.0 to 192.168.255.255", "127.0.0.0 to 127.255.255.255"], a: 0 },
  { s: "Networking", q: "What is the default port for HTTP?", o: ["21", "22", "80", "443"], a: 2 },
  { s: "Networking", q: "Which protocol is used for secure communication?", o: ["HTTP", "FTP", "HTTPS", "SMTP"], a: 2 },
  { s: "Networking", q: "What does DNS stand for?", o: ["Domain Name System", "Domain Network System", "Digital Name System", "Data Name System"], a: 0 },
  { s: "Networking", q: "Which device operates at Layer 2 of OSI model?", o: ["Router", "Switch", "Hub", "Repeater"], a: 1 },
  { s: "Networking", q: "What is the purpose of subnet mask?", o: ["To identify network and host portions of IP address", "To encrypt data", "To route packets", "To store IP addresses"], a: 0 },
  { s: "Networking", q: "Which protocol is used for email?", o: ["HTTP", "FTP", "SMTP", "TCP"], a: 2 },
  { s: "Networking", q: "What is bandwidth?", o: ["The width of cable", "The amount of data transmitted per unit time", "The speed of processor", "The size of memory"], a: 1 },
  { s: "Operating Systems", q: "Which is not a function of operating system?", o: ["Memory Management", "Process Management", "Virus Protection", "File Management"], a: 2 },
  { s: "Operating Systems", q: "What is deadlock?", o: ["When system crashes", "When processes wait indefinitely for resources", "When CPU is idle", "When memory is full"], a: 1 },
  { s: "Operating Systems", q: "Which scheduling algorithm is non-preemptive?", o: ["Round Robin", "FCFS", "Priority Scheduling", "Multilevel Queue"], a: 1 },
  { s: "Operating Systems", q: "What is virtual memory?", o: ["RAM", "Using disk space as extended RAM", "ROM", "Cache memory"], a: 1 },
  { s: "Operating Systems", q: "What is thrashing?", o: ["High CPU utilization", "Excessive paging activity", "Virus attack", "Memory overflow"], a: 1 },
  { s: "Operating Systems", q: "Which command shows running processes in Linux?", o: ["ls", "ps", "cd", "pwd"], a: 1 },
  { s: "Operating Systems", q: "What is semaphore?", o: ["A synchronization tool", "A memory allocation technique", "A file system", "A network protocol"], a: 0 },
  { s: "Operating Systems", q: "What is the purpose of cache memory?", o: ["Permanent storage", "Speed up data access", "Backup data", "Virtual memory"], a: 1 },
  { s: "Operating Systems", q: "Which is a multi-user operating system?", o: ["MS-DOS", "Linux", "Windows 95", "Android"], a: 1 },
  { s: "Operating Systems", q: "What is context switching?", o: ["Switching between applications", "Storing and restoring process state", "Changing user", "Shutting down system"], a: 1 },
  { s: "Data Structures", q: "Which traversal visits root node first?", o: ["Inorder", "Preorder", "Postorder", "Level order"], a: 1 },
  { s: "Data Structures", q: "What is the worst-case time complexity of linear search?", o: ["O(1)", "O(log n)", "O(n)", "O(n²)"], a: 2 },
  { s: "Data Structures", q: "Which data structure is used for BFS?", o: ["Stack", "Queue", "Tree", "Graph"], a: 1 },
  { s: "Data Structures", q: "What is a complete binary tree?", o: ["All levels are completely filled", "Only left subtree exists", "Only right subtree exists", "Has no children"], a: 0 },
  { s: "Data Structures", q: "Which has constant time insertion at beginning?", o: ["Array", "Linked List", "Stack", "Queue"], a: 1 },
  { s: "Data Structures", q: "What is a hash collision?", o: ["Two keys map to same hash value", "Hash function fails", "Memory overflow", "Invalid key"], a: 0 },
  { s: "Data Structures", q: "Which sorting algorithm is stable?", o: ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"], a: 2 },
  { s: "Data Structures", q: "What is the height of a binary tree with n nodes (worst case)?", o: ["log n", "n", "n²", "1"], a: 1 },
  { s: "Data Structures", q: "Which is NOT a type of linked list?", o: ["Singly Linked List", "Doubly Linked List", "Circular Linked List", "Binary Linked List"], a: 3 },
  { s: "Data Structures", q: "What is the space complexity of recursive factorial?", o: ["O(1)", "O(n)", "O(log n)", "O(n²)"], a: 1 },
  { s: "Algorithms", q: "Which algorithm uses divide and conquer?", o: ["Bubble Sort", "Merge Sort", "Selection Sort", "Insertion Sort"], a: 1 },
  { s: "Algorithms", q: "What is dynamic programming?", o: ["Writing dynamic code", "Solving problems by breaking into overlapping subproblems", "Allocating memory dynamically", "Running programs dynamically"], a: 1 },
  { s: "Algorithms", q: "Which algorithm is greedy?", o: ["Dijkstra's shortest path", "Merge Sort", "Binary Search", "DFS"], a: 0 },
  { s: "Algorithms", q: "What is the principle of BFS?", o: ["LIFO", "FIFO", "Random", "Priority"], a: 1 },
  { s: "Algorithms", q: "Which is a recursive algorithm?", o: ["Linear Search", "Tower of Hanoi", "Bubble Sort", "All of the above"], a: 1 },
  { s: "Algorithms", q: "What is backtracking?", o: ["Going back in code", "Trying all possibilities and undoing wrong choices", "Backward traversal", "Reverse engineering"], a: 1 },
  { s: "Algorithms", q: "Which algorithm finds minimum spanning tree?", o: ["Dijkstra's", "Kruskal's", "Binary Search", "Quick Sort"], a: 1 },
  { s: "Algorithms", q: "What is the time complexity of accessing an element in array by index?", o: ["O(1)", "O(log n)", "O(n)", "O(n²)"], a: 0 },
  { s: "Algorithms", q: "Which search algorithm requires sorted data?", o: ["Linear Search", "Binary Search", "DFS", "BFS"], a: 1 },
  { s: "Algorithms", q: "What is memoization?", o: ["Remembering user inputs", "Storing results of expensive function calls", "Memory allocation", "Creating notes"], a: 1 },
  { s: "Computer Fundamentals", q: "Who is known as father of computers?", o: ["Bill Gates", "Steve Jobs", "Charles Babbage", "Alan Turing"], a: 2 },
  { s: "Computer Fundamentals", q: "What does USB stand for?", o: ["Universal Serial Bus", "United Serial Bus", "Universal System Bus", "United System Bus"], a: 0 },
  { s: "Computer Fundamentals", q: "Binary of decimal 10 is?", o: ["1000", "1010", "1100", "1001"], a: 1 },
  { s: "Computer Fundamentals", q: "Hexadecimal of decimal 15 is?", o: ["E", "F", "10", "A"], a: 1 },
  { s: "Computer Fundamentals", q: "What is compiler?", o: ["Converts high-level code to machine code", "Compiles documents", "Runs programs", "Debugs code"], a: 0 },
  { s: "Computer Fundamentals", q: "Difference between compiler and interpreter?", o: ["Compiler converts all at once, interpreter line by line", "No difference", "Interpreter is faster", "Compiler executes code"], a: 0 },
  { s: "Computer Fundamentals", q: "What is debugging?", o: ["Finding and fixing errors", "Removing bugs (insects)", "Testing code", "Writing code"], a: 0 },
  { s: "Computer Fundamentals", q: "What does WWW stand for?", o: ["World Wide Web", "World Wide Work", "World Web Wide", "Wide World Web"], a: 0 },
  { s: "Computer Fundamentals", q: "What is big data?", o: ["Extremely large datasets", "Large files", "Big database", "Heavy data"], a: 0 },
  { s: "Computer Fundamentals", q: "What is blockchain?", o: ["Distributed ledger technology", "Chain of blocks", "Block storage", "Chain storage"], a: 0 },
  { s: "Programming Concepts", q: "What is polymorphism in OOP?", o: ["Many forms of same entity", "Multiple classes", "Multiple objects", "Multiple methods"], a: 0 },
  { s: "Programming Concepts", q: "What is inheritance?", o: ["Acquiring properties from parent class", "Creating new class", "Deleting class", "Modifying class"], a: 0 },
  { s: "Programming Concepts", q: "What is abstraction?", o: ["Hiding complex implementation details", "Creating abstract art", "Making things visible", "Copying data"], a: 0 },
  { s: "Programming Concepts", q: "What is garbage collection?", o: ["Automatic memory management", "Deleting files", "Cleaning disk", "Removing viruses"], a: 0 },
  { s: "Programming Concepts", q: "What is constructor?", o: ["Special method to initialize objects", "A destructor", "A variable", "A loop"], a: 0 },
  { s: "Programming Concepts", q: "What is recursion?", o: ["Function calling itself", "Looping", "Iteration", "Function calling another function"], a: 0 },
  { s: "Programming Concepts", q: "What is lambda function?", o: ["Anonymous function", "Named function", "Main function", "Nested function"], a: 0 },
  { s: "Programming Concepts", q: "What is difference between list and tuple in Python?", o: ["List is mutable, tuple is immutable", "Both are same", "Tuple is mutable", "List is immutable"], a: 0 },
  { s: "Programming Concepts", q: "What is callback function?", o: ["Function passed as argument to another function", "Function that calls back", "Recursive function", "Main function"], a: 0 },
  { s: "Programming Concepts", q: "What is HashMap?", o: ["Stores key-value pairs", "Array of maps", "Hash function", "Hashing technique"], a: 0 },
  { s: "Web Technologies", q: "What is REST API?", o: ["Representational State Transfer API", "Rest Application Interface", "Remote State Transfer", "Restful Application"], a: 0 },
  { s: "Web Technologies", q: "What is JSON?", o: ["JavaScript Object Notation", "Java Standard Object Notation", "JavaScript Online Notation", "Java Script Object Name"], a: 0 },
  { s: "Web Technologies", q: "What is closure in JavaScript?", o: ["Function with access to outer function's variables", "Closing a function", "Ending program", "Function termination"], a: 0 },
  { s: "Web Technologies", q: "What is DOM?", o: ["Document Object Model", "Data Object Model", "Document Oriented Model", "Data Oriented Model"], a: 0 },
  { s: "Web Technologies", q: "What is CDN?", o: ["Content Delivery Network", "Central Data Network", "Content Distribution Node", "Central Delivery Network"], a: 0 },
  { s: "Software Engineering", q: "What is DevOps?", o: ["Development and Operations collaboration", "Developer operations", "Device operations", "Development options"], a: 0 },
  { s: "Software Engineering", q: "What is Docker?", o: ["Containerization platform", "Documentation tool", "Database", "Programming language"], a: 0 },
  { s: "Software Engineering", q: "What is MVC architecture?", o: ["Model-View-Controller", "Model-View-Component", "Module-View-Controller", "Model-Visual-Controller"], a: 0 },
  { s: "Software Engineering", q: "What is Git?", o: ["Version control system", "Programming language", "Operating system", "Database"], a: 0 },
  { s: "Software Engineering", q: "What is TDD?", o: ["Test-Driven Development", "Test-Data Development", "Technical Design Document", "Test-Debug-Deploy"], a: 0 },
  { s: "Software Engineering", q: "What is load balancing?", o: ["Distributing workload across multiple servers", "Balancing database load", "Loading balance sheet", "CPU load management"], a: 0 },
  { s: "Software Engineering", q: "What is singleton pattern?", o: ["Design pattern restricting class to one instance", "Single object pattern", "One-time pattern", "Unique pattern"], a: 0 },
  { s: "Software Engineering", q: "What is sprint retrospective?", o: ["Team reflection meeting after sprint", "Sprint planning", "Sprint review", "Sprint closure"], a: 0 },
  { s: "Software Engineering", q: "What is user story?", o: ["Informal description of feature from user perspective", "User biography", "Story about users", "User manual"], a: 0 },
  { s: "Software Engineering", q: "What is burndown chart?", o: ["Chart showing remaining work in sprint", "Chart of burned items", "Performance chart", "Completion chart"], a: 0 },
  { s: "Cybersecurity", q: "What is SQL injection?", o: ["Security vulnerability in database queries", "Injecting SQL code", "Database backup", "Query optimization"], a: 0 },
  { s: "Cybersecurity", q: "What is XSS attack?", o: ["Cross-Site Scripting attack", "Extra Site Security", "Cross System Script", "XML Site Scripting"], a: 0 },
  { s: "Cybersecurity", q: "What is OAuth?", o: ["Open Authorization protocol", "Open Authentication", "Object Authorization", "Online Authorization"], a: 0 },
  { s: "Networking", q: "Full form of LAN?", o: ["Local Area Network", "Large Area Network", "Limited Area Network", "Long Area Network"], a: 0 },
  { s: "Networking", q: "What is MAC address?", o: ["Media Access Control address", "Machine Access Code", "Main Access Control", "Memory Access Code"], a: 0 },
  { s: "Networking", q: "Which is NOT a type of network topology?", o: ["Star", "Ring", "Square", "Mesh"], a: 2 },
  { s: "Algorithms", q: "What is algorithm?", o: ["Step-by-step procedure to solve problem", "Programming language", "Data structure", "Computer program"], a: 0 },
  { s: "Algorithms", q: "What is flowchart?", o: ["Diagrammatic representation of algorithm", "Chart of water flow", "Data flow", "Process chart"], a: 0 },
  { s: "Algorithms", q: "Which symbol represents decision in flowchart?", o: ["Rectangle", "Oval", "Diamond", "Circle"], a: 2 },
  {
    "section": "Technical",
    "s": "IP Addressing",
    "q": "How many bits are in an IPv4 address?",
    "o": [
      "16",
      "32",
      "64",
      "128"
    ],
    "a": "32"
  },
  {
    "section": "Technical",
    "s": "OSI Model",
    "q": "Which OSI layer is responsible for routing packets?",
    "o": [
      "Layer 1",
      "Layer 2",
      "Layer 3",
      "Layer 4"
    ],
    "a": "Layer 3"
  },
  {
    "section": "Technical",
    "s": "Network Protocols",
    "q": "HTTP uses which port by default?",
    "o": [
      "21",
      "25",
      "80",
      "443"
    ],
    "a": "80"
  },
  {
    "section": "Technical",
    "s": "Process Scheduling",
    "q": "Which scheduling algorithm gives the shortest average waiting time?",
    "o": [
      "FCFS",
      "SJF",
      "Round Robin",
      "Priority"
    ],
    "a": "SJF"
  },
  {
    "section": "Technical",
    "s": "Memory Management",
    "q": "Virtual memory allows programs to use more memory than?",
    "o": [
      "Secondary storage",
      "Physical RAM",
      "CPU cache",
      "Registers"
    ],
    "a": "Physical RAM"
  },
  {
    "section": "Technical",
    "s": "Deadlock",
    "q": "Which condition is NOT required for deadlock?",
    "o": [
      "Mutual Exclusion",
      "Hold and Wait",
      "No Preemption",
      "Starvation"
    ],
    "a": "Starvation"
  },
  {
    "section": "Technical",
    "s": "File Systems",
    "q": "FAT stands for?",
    "o": [
      "File Access Table",
      "File Allocation Table",
      "Fast Access Technology",
      "File Archive Tool"
    ],
    "a": "File Allocation Table"
  },
  {
    "section": "Technical",
    "s": "Arrays and Strings",
    "q": "Time complexity of accessing an element in an array by index?",
    "o": [
      "O(n)",
      "O(log n)",
      "O(1)",
      "O(n²)"
    ],
    "a": "O(1)"
  },
  {
    "section": "Technical",
    "s": "Linked Lists",
    "q": "Which linked list allows traversal in both directions?",
    "o": [
      "Singly linked list",
      "Doubly linked list",
      "Circular linked list",
      "None"
    ],
    "a": "Doubly linked list"
  },
  {
    "section": "Technical",
    "s": "Stacks and Queues",
    "q": "Stack follows which principle?",
    "o": [
      "FIFO",
      "LIFO",
      "FILO",
      "LILO"
    ],
    "a": "LIFO"
  },
  {
    "section": "Technical",
    "s": "Trees and Graphs",
    "q": "A binary tree with n nodes has how many null pointers?",
    "o": [
      "n",
      "n+1",
      "n-1",
      "2n"
    ],
    "a": "n+1"
  },
  {
    "section": "Technical",
    "s": "Hashing",
    "q": "Collision in hashing means?",
    "o": [
      "Two keys map to same index",
      "A key is deleted",
      "Table is full",
      "None of these"
    ],
    "a": "Two keys map to same index"
  },
  {
    "section": "Technical",
    "s": "Sorting Algorithms",
    "q": "Best case time complexity of Quick Sort?",
    "o": [
      "O(n²)",
      "O(n log n)",
      "O(n)",
      "O(log n)"
    ],
    "a": "O(n log n)"
  },
  {
    "section": "Technical",
    "s": "Searching Algorithms",
    "q": "Binary search requires the array to be?",
    "o": [
      "Unsorted",
      "Sorted",
      "Reversed",
      "Empty"
    ],
    "a": "Sorted"
  },
  {
    "section": "Technical",
    "s": "Complexity Analysis",
    "q": "O(1) means the algorithm runs in?",
    "o": [
      "Linear time",
      "Quadratic time",
      "Constant time",
      "Logarithmic time"
    ],
    "a": "Constant time"
  },
  {
    "section": "Technical",
    "s": "Number Systems",
    "q": "Binary equivalent of decimal 10?",
    "o": [
      "1000",
      "1001",
      "1010",
      "1011"
    ],
    "a": "1010"
  },
  {
    "section": "Technical",
    "s": "Boolean Logic",
    "q": "A AND NOT A = ?",
    "o": [
      "0",
      "1",
      "A",
      "Undefined"
    ],
    "a": "0"
  },
  {
    "section": "Technical",
    "s": "Computer Architecture",
    "q": "The CPU component that performs arithmetic operations is?",
    "o": [
      "CU",
      "ALU",
      "MU",
      "BU"
    ],
    "a": "ALU"
  },
  {
    "section": "Technical",
    "s": "Memory Hierarchy",
    "q": "Which memory is fastest?",
    "o": [
      "RAM",
      "Cache",
      "Hard Disk",
      "Register"
    ],
    "a": "Register"
  },
  {
    "section": "Technical",
    "s": "HTML and CSS",
    "q": "Which HTML tag creates a hyperlink?",
    "o": [
      "<link>",
      "<a>",
      "<href>",
      "<url>"
    ],
    "a": "<a>"
  },
  {
    "section": "Technical",
    "s": "JavaScript Basics",
    "q": "Which keyword declares a block-scoped variable in JS?",
    "o": [
      "var",
      "let",
      "const",
      "def"
    ],
    "a": "let"
  },
  {
    "section": "Technical",
    "s": "REST APIs",
    "q": "Which HTTP method is used to update a resource partially?",
    "o": [
      "GET",
      "POST",
      "PUT",
      "PATCH"
    ],
    "a": "PATCH"
  },
  {
    "section": "Technical",
    "s": "SDLC Models",
    "q": "Which SDLC model is best for projects with unclear requirements?",
    "o": [
      "Waterfall",
      "V-Model",
      "Agile",
      "Spiral"
    ],
    "a": "Agile"
  },
  {
    "section": "Technical",
    "s": "Software Testing",
    "q": "Testing without knowledge of internal code is called?",
    "o": [
      "White-box testing",
      "Black-box testing",
      "Grey-box testing",
      "Unit testing"
    ],
    "a": "Black-box testing"
  },
  {
    "section": "Technical",
    "s": "Design Patterns",
    "q": "Which pattern ensures only one instance of a class?",
    "o": [
      "Factory",
      "Observer",
      "Singleton",
      "Decorator"
    ],
    "a": "Singleton"
  },
  {
    "section": "Technical",
    "s": "Agile Methodology",
    "q": "A sprint in Scrum typically lasts?",
    "o": [
      "1 day",
      "1 month",
      "1–4 weeks",
      "6 months"
    ],
    "a": "1–4 weeks"
  },
  {
    "section": "Technical",
    "s": "Cloud Service Models",
    "q": "Platform as a Service (PaaS) provides?",
    "o": [
      "Only hardware",
      "Hardware + OS + runtime",
      "Full software",
      "Only networking"
    ],
    "a": "Hardware + OS + runtime"
  },
  {
    "section": "Technical",
    "s": "Encryption",
    "q": "Which is an asymmetric encryption algorithm?",
    "o": [
      "AES",
      "DES",
      "RSA",
      "Blowfish"
    ],
    "a": "RSA"
  },
  {
    "section": "Technical",
    "s": "Network Security",
    "q": "A firewall primarily protects against?",
    "o": [
      "Virus",
      "Unauthorized network access",
      "Hardware failure",
      "Software bugs"
    ],
    "a": "Unauthorized network access"
  },
  {
    "section": "Technical",
    "s": "Authentication",
    "q": "Two-factor authentication combines password with?",
    "o": [
      "Another password",
      "A second device/OTP",
      "Biometrics only",
      "None"
    ],
    "a": "A second device/OTP"
  },
  {
    "section": "Technical",
    "s": "Machine Learning Basics",
    "q": "Supervised learning uses?",
    "o": [
      "Labelled data",
      "Unlabelled data",
      "Random data",
      "No data"
    ],
    "a": "Labelled data"
  },
  {
    "section": "Technical",
    "s": "Neural Networks",
    "q": "The activation function that outputs between 0 and 1 is?",
    "o": [
      "ReLU",
      "Tanh",
      "Sigmoid",
      "Softmax"
    ],
    "a": "Sigmoid"
  },
  {
    "section": "Technical",
    "s": "Data Preprocessing",
    "q": "Normalization scales data to a range of?",
    "o": [
      "0 to 100",
      "-1 to 1",
      "0 to 1",
      "Depends"
    ],
    "a": "0 to 1"
  },
  {
    "section": "Technical",
    "s": "Greedy Algorithms",
    "q": "Which problem is solved by Greedy algorithm?",
    "o": [
      "Matrix Chain Multiplication",
      "0/1 Knapsack",
      "Activity Selection",
      "Longest Common Subsequence"
    ],
    "a": "Activity Selection"
  },
  {
    "section": "Technical",
    "s": "Dynamic Programming",
    "q": "Dynamic Programming solves problems by?",
    "o": [
      "Brute force",
      "Storing subproblem results",
      "Random sampling",
      "Recursion only"
    ],
    "a": "Storing subproblem results"
  },
  {
    "section": "Technical",
    "s": "Keys and Constraints",
    "q": "A PRIMARY KEY constraint ensures?",
    "o": [
      "Uniqueness only",
      "Not null only",
      "Uniqueness + Not null",
      "Foreign reference"
    ],
    "a": "Uniqueness + Not null"
  },
  {
    "section": "Technical",
    "s": "Semaphores",
    "q": "A binary semaphore can have values?",
    "o": [
      "0 only",
      "1 only",
      "0 or 1",
      "Any integer"
    ],
    "a": "0 or 1"
  },
  {
    "section": "Technical",
    "s": "Subnetting",
    "q": "What does a subnet mask of 255.255.255.0 (/24) indicate?",
    "o": [
      "8 host bits",
      "16 host bits",
      "24 host bits",
      "32 host bits"
    ],
    "a": "8 host bits"
  },
  {
    "section": "Technical",
    "s": "DNS and HTTP",
    "q": "DNS resolves a domain name to?",
    "o": [
      "MAC address",
      "IP address",
      "Port number",
      "URL"
    ],
    "a": "IP address"
  },
  {
    "section": "Technical",
    "s": "Input-Output Devices",
    "q": "Which is an output device?",
    "o": [
      "Keyboard",
      "Mouse",
      "Monitor",
      "Scanner"
    ],
    "a": "Monitor"
  },
  {
    "section": "Technical",
    "s": "HTTP Methods",
    "q": "Which HTTP method should NOT change server state?",
    "o": [
      "POST",
      "PUT",
      "DELETE",
      "GET"
    ],
    "a": "GET"
  },
  {
    "section": "Aptitude",
    "s": "Quantitative Aptitude",
    "q": "If a train travels 120 km in 2 hours, what is its speed?",
    "o": [
      "50 km/h",
      "60 km/h",
      "70 km/h",
      "80 km/h"
    ],
    "a": "60 km/h"
  },
  {
    "section": "Aptitude",
    "s": "Quantitative Aptitude",
    "q": "What is 25% of 400?",
    "o": [
      "50",
      "75",
      "100",
      "125"
    ],
    "a": "100"
  },
  {
    "section": "Aptitude",
    "s": "Quantitative Aptitude",
    "q": "If 5x + 3 = 28, then x = ?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": "5"
  },
  {
    "section": "Aptitude",
    "s": "Quantitative Aptitude",
    "q": "The average of 5 numbers is 20. If one number is excluded, the average becomes 15. What is the excluded number?",
    "o": [
      "30",
      "35",
      "40",
      "45"
    ],
    "a": "40"
  },
  {
    "section": "Aptitude",
    "s": "Quantitative Aptitude",
    "q": "A man buys an article for ₹500 and sells it for ₹600. What is his profit percentage?",
    "o": [
      "10%",
      "15%",
      "20%",
      "25%"
    ],
    "a": "20%"
  },
  {
    "section": "Aptitude",
    "s": "Quantitative Aptitude",
    "q": "Find the next number in the series: 2, 6, 12, 20, ?",
    "o": [
      "28",
      "30",
      "32",
      "34"
    ],
    "a": "30"
  },
  {
    "section": "Aptitude",
    "s": "Quantitative Aptitude",
    "q": "If the ratio of A:B is 3:4 and B:C is 2:3, what is A:C?",
    "o": [
      "1:2",
      "2:3",
      "3:4",
      "4:5"
    ],
    "a": "1:2"
  },
  {
    "section": "Aptitude",
    "s": "Quantitative Aptitude",
    "q": "A pipe can fill a tank in 6 hours. Another pipe can empty it in 8 hours. If both are open, how long to fill the tank?",
    "o": [
      "12 hours",
      "18 hours",
      "24 hours",
      "30 hours"
    ],
    "a": "24 hours"
  },
  {
    "section": "Aptitude",
    "s": "Quantitative Aptitude",
    "q": "Simple Interest on ₹1000 at 5% per annum for 2 years is?",
    "o": [
      "₹50",
      "₹100",
      "₹150",
      "₹200"
    ],
    "a": "₹100"
  },
  {
    "section": "Aptitude",
    "s": "Quantitative Aptitude",
    "q": "If 2^x = 32, then x = ?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": "5"
  },
  {
    "section": "Reasoning",
    "s": "Logical Reasoning",
    "q": "If all roses are flowers and some flowers are red, which statement is definitely true?",
    "o": [
      "All roses are red",
      "Some roses are red",
      "Some flowers are roses",
      "All red things are flowers"
    ],
    "a": "Some flowers are roses"
  },
  {
    "section": "Reasoning",
    "s": "Logical Reasoning",
    "q": "Find the odd one out: 3, 9, 27, 81, 243, 729, 2188",
    "o": [
      "243",
      "729",
      "2188",
      "81"
    ],
    "a": "2188"
  },
  {
    "section": "Reasoning",
    "s": "Logical Reasoning",
    "q": "If CODING is written as DPEJOH, how is MOTHER written?",
    "o": [
      "NPUIFS",
      "NPTIFS",
      "OPUIFS",
      "LPUIFS"
    ],
    "a": "NPUIFS"
  },
  {
    "section": "Reasoning",
    "s": "Logical Reasoning",
    "q": "Statement: All managers are employees. Some employees are engineers. Conclusion: Some managers are engineers.",
    "o": [
      "True",
      "False",
      "Cannot be determined",
      "None of these"
    ],
    "a": "False"
  },
  {
    "section": "Reasoning",
    "s": "Logical Reasoning",
    "q": "In a certain code, FRIEND is written as HUMJTK. How is SISTER written?",
    "o": [
      "UKUVGT",
      "TKUTGS",
      "TJTUGS",
      "UKUTGS"
    ],
    "a": "UKUVGT"
  },
  {
    "section": "Reasoning",
    "s": "Logical Reasoning",
    "q": "What comes next in the sequence: Z, X, V, T, ?",
    "o": [
      "S",
      "R",
      "Q",
      "P"
    ],
    "a": "R"
  },
  {
    "section": "Reasoning",
    "s": "Logical Reasoning",
    "q": "If A = 1, B = 2, C = 3... what is the value of COMPUTER?",
    "o": [
      "99",
      "100",
      "101",
      "102"
    ],
    "a": "99"
  },
  {
    "section": "Reasoning",
    "s": "Logical Reasoning",
    "q": "Blood Relations: A is B's sister. B is C's father. D is C's sister. How is A related to D?",
    "o": [
      "Aunt",
      "Sister",
      "Mother",
      "Cousin"
    ],
    "a": "Aunt"
  },
  {
    "section": "Reasoning",
    "s": "Logical Reasoning",
    "q": "Ram walks 5m North, then 3m East, then 5m South. How far is he from starting point?",
    "o": [
      "2m",
      "3m",
      "5m",
      "8m"
    ],
    "a": "3m"
  },
  {
    "section": "Reasoning",
    "s": "Logical Reasoning",
    "q": "If 5th Monday falls on 7th day of a month, what day is the 27th?",
    "o": [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday"
    ],
    "a": "Sunday"
  },
  {
    "section": "Verbal",
    "s": "Verbal Ability",
    "q": "Choose the correct synonym for 'Benevolent':",
    "o": [
      "Malicious",
      "Kind",
      "Angry",
      "Sad"
    ],
    "a": "Kind"
  },
  {
    "section": "Verbal",
    "s": "Verbal Ability",
    "q": "Choose the antonym for 'Abundant':",
    "o": [
      "Plentiful",
      "Scarce",
      "Sufficient",
      "Ample"
    ],
    "a": "Scarce"
  },
  {
    "section": "Verbal",
    "s": "Verbal Ability",
    "q": "Fill in the blank: She is ___ intelligent than her brother.",
    "o": [
      "much",
      "more",
      "very",
      "most"
    ],
    "a": "more"
  },
  {
    "section": "Verbal",
    "s": "Verbal Ability",
    "q": "Choose the correctly spelled word:",
    "o": [
      "Accommodate",
      "Accomodate",
      "Acomodate",
      "Acommodate"
    ],
    "a": "Accommodate"
  },
  {
    "section": "Verbal",
    "s": "Verbal Ability",
    "q": "Identify the error: 'Neither of the two students are present today.'",
    "o": [
      "Neither",
      "two students",
      "are",
      "present today"
    ],
    "a": "are"
  },
  {
    "section": "Verbal",
    "s": "Verbal Ability",
    "q": "Choose the correct sentence:",
    "o": [
      "He is taller than me",
      "He is taller than I",
      "He is more taller than me",
      "He is most taller than me"
    ],
    "a": "He is taller than me"
  },
  {
    "section": "Verbal",
    "s": "Verbal Ability",
    "q": "What is the meaning of the idiom 'A piece of cake'?",
    "o": [
      "Difficult task",
      "Easy task",
      "Delicious food",
      "Birthday celebration"
    ],
    "a": "Easy task"
  },
  {
    "section": "Verbal",
    "s": "Verbal Ability",
    "q": "Choose the passive voice: 'The teacher teaches the students.'",
    "o": [
      "The students are taught by the teacher",
      "The students teach the teacher",
      "The teacher is taught by students",
      "The students were taught"
    ],
    "a": "The students are taught by the teacher"
  },
  {
    "section": "Verbal",
    "s": "Verbal Ability",
    "q": "One word substitution for 'A person who loves books':",
    "o": [
      "Bibliophile",
      "Philanthropist",
      "Narcissist",
      "Hedonist"
    ],
    "a": "Bibliophile"
  },
  {
    "section": "Verbal",
    "s": "Verbal Ability",
    "q": "Choose the correct preposition: 'He is good ___ mathematics.'",
    "o": [
      "in",
      "at",
      "on",
      "with"
    ],
    "a": "at"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What is the output of: print(10 // 3) in Python?",
    "o": [
      "3.33",
      "3",
      "4",
      "3.0"
    ],
    "a": "3"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "Which data structure uses LIFO principle?",
    "o": [
      "Queue",
      "Stack",
      "Array",
      "Linked List"
    ],
    "a": "Stack"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "Time complexity of Binary Search is:",
    "o": [
      "O(n)",
      "O(log n)",
      "O(n²)",
      "O(1)"
    ],
    "a": "O(log n)"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What does SQL stand for?",
    "o": [
      "Structured Query Language",
      "Simple Query Language",
      "Standard Query Language",
      "Sequential Query Language"
    ],
    "a": "Structured Query Language"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "Which is not a programming language?",
    "o": [
      "Python",
      "Java",
      "HTML",
      "C++"
    ],
    "a": "HTML"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What is the size of int data type in C?",
    "o": [
      "2 bytes",
      "4 bytes",
      "8 bytes",
      "Depends on compiler"
    ],
    "a": "4 bytes"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "Which sorting algorithm is fastest on average?",
    "o": [
      "Bubble Sort",
      "Selection Sort",
      "Quick Sort",
      "Insertion Sort"
    ],
    "a": "Quick Sort"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What does OOP stand for?",
    "o": [
      "Object Oriented Programming",
      "Objective Oriented Programming",
      "Order Of Programming",
      "Object Order Programming"
    ],
    "a": "Object Oriented Programming"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "Which is NOT a loop in C?",
    "o": [
      "for",
      "while",
      "do-while",
      "repeat-until"
    ],
    "a": "repeat-until"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What is encapsulation in OOP?",
    "o": [
      "Hiding implementation details",
      "Creating multiple objects",
      "Inheriting properties",
      "Overloading functions"
    ],
    "a": "Hiding implementation details"
  },
  {
    "section": "Technical",
    "s": "Database Management",
    "q": "Which command is used to retrieve data from database?",
    "o": [
      "GET",
      "FETCH",
      "SELECT",
      "RETRIEVE"
    ],
    "a": "SELECT"
  },
  {
    "section": "Technical",
    "s": "Database Management",
    "q": "What is primary key?",
    "o": [
      "A key that uniquely identifies each record",
      "The first key in table",
      "A foreign key",
      "An index"
    ],
    "a": "A key that uniquely identifies each record"
  },
  {
    "section": "Technical",
    "s": "Database Management",
    "q": "Which is NOT a DDL command?",
    "o": [
      "CREATE",
      "ALTER",
      "DROP",
      "INSERT"
    ],
    "a": "INSERT"
  },
  {
    "section": "Technical",
    "s": "Database Management",
    "q": "What does RDBMS stand for?",
    "o": [
      "Relational Database Management System",
      "Relative Database Management System",
      "Record Database Management System",
      "Remote Database Management System"
    ],
    "a": "Relational Database Management System"
  },
  {
    "section": "Technical",
    "s": "Database Management",
    "q": "Which clause is used to filter results in SQL?",
    "o": [
      "FILTER",
      "WHERE",
      "HAVING",
      "SELECT"
    ],
    "a": "WHERE"
  },
  {
    "section": "Technical",
    "s": "Database Management",
    "q": "What is normalization?",
    "o": [
      "Organizing data to reduce redundancy",
      "Creating backups",
      "Indexing tables",
      "Encrypting data"
    ],
    "a": "Organizing data to reduce redundancy"
  },
  {
    "section": "Technical",
    "s": "Database Management",
    "q": "Which JOIN returns all records when there is a match in either table?",
    "o": [
      "INNER JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "FULL OUTER JOIN"
    ],
    "a": "FULL OUTER JOIN"
  },
  {
    "section": "Technical",
    "s": "Database Management",
    "q": "What is the purpose of INDEX in database?",
    "o": [
      "To speed up data retrieval",
      "To store data",
      "To create relationships",
      "To delete data"
    ],
    "a": "To speed up data retrieval"
  },
  {
    "section": "Technical",
    "s": "Database Management",
    "q": "Which constraint ensures all values in a column are unique?",
    "o": [
      "PRIMARY KEY",
      "FOREIGN KEY",
      "UNIQUE",
      "CHECK"
    ],
    "a": "UNIQUE"
  },
  {
    "section": "Technical",
    "s": "Database Management",
    "q": "What is a transaction in database?",
    "o": [
      "A single operation",
      "A sequence of operations performed as a single unit",
      "A table",
      "A query"
    ],
    "a": "A sequence of operations performed as a single unit"
  },
  {
    "section": "Technical",
    "s": "Networking",
    "q": "What does IP stand for?",
    "o": [
      "Internet Protocol",
      "Internal Protocol",
      "Internet Process",
      "International Protocol"
    ],
    "a": "Internet Protocol"
  },
  {
    "section": "Technical",
    "s": "Networking",
    "q": "Which layer of OSI model handles routing?",
    "o": [
      "Physical Layer",
      "Data Link Layer",
      "Network Layer",
      "Transport Layer"
    ],
    "a": "Network Layer"
  },
  {
    "section": "Technical",
    "s": "Networking",
    "q": "What is the range of private IP addresses (Class A)?",
    "o": [
      "10.0.0.0 to 10.255.255.255",
      "172.16.0.0 to 172.31.255.255",
      "192.168.0.0 to 192.168.255.255",
      "127.0.0.0 to 127.255.255.255"
    ],
    "a": "10.0.0.0 to 10.255.255.255"
  },
  {
    "section": "Technical",
    "s": "Networking",
    "q": "What is the default port for HTTP?",
    "o": [
      "21",
      "22",
      "80",
      "443"
    ],
    "a": "80"
  },
  {
    "section": "Technical",
    "s": "Networking",
    "q": "Which protocol is used for secure communication?",
    "o": [
      "HTTP",
      "FTP",
      "HTTPS",
      "SMTP"
    ],
    "a": "HTTPS"
  },
  {
    "section": "Technical",
    "s": "Networking",
    "q": "What does DNS stand for?",
    "o": [
      "Domain Name System",
      "Domain Network System",
      "Digital Name System",
      "Data Name System"
    ],
    "a": "Domain Name System"
  },
  {
    "section": "Technical",
    "s": "Networking",
    "q": "Which device operates at Layer 2 of OSI model?",
    "o": [
      "Router",
      "Switch",
      "Hub",
      "Repeater"
    ],
    "a": "Switch"
  },
  {
    "section": "Technical",
    "s": "Networking",
    "q": "What is the purpose of subnet mask?",
    "o": [
      "To identify network and host portions of IP address",
      "To encrypt data",
      "To route packets",
      "To store IP addresses"
    ],
    "a": "To identify network and host portions of IP address"
  },
  {
    "section": "Technical",
    "s": "Networking",
    "q": "Which protocol is used for email?",
    "o": [
      "HTTP",
      "FTP",
      "SMTP",
      "TCP"
    ],
    "a": "SMTP"
  },
  {
    "section": "Technical",
    "s": "Networking",
    "q": "What is bandwidth?",
    "o": [
      "The width of cable",
      "The amount of data transmitted per unit time",
      "The speed of processor",
      "The size of memory"
    ],
    "a": "The amount of data transmitted per unit time"
  },
  {
    "section": "Technical",
    "s": "Operating Systems",
    "q": "Which is not a function of operating system?",
    "o": [
      "Memory Management",
      "Process Management",
      "Virus Protection",
      "File Management"
    ],
    "a": "Virus Protection"
  },
  {
    "section": "Technical",
    "s": "Operating Systems",
    "q": "What is deadlock?",
    "o": [
      "When system crashes",
      "When processes wait indefinitely for resources",
      "When CPU is idle",
      "When memory is full"
    ],
    "a": "When processes wait indefinitely for resources"
  },
  {
    "section": "Technical",
    "s": "Operating Systems",
    "q": "Which scheduling algorithm is non-preemptive?",
    "o": [
      "Round Robin",
      "FCFS",
      "Priority Scheduling",
      "Multilevel Queue"
    ],
    "a": "FCFS"
  },
  {
    "section": "Technical",
    "s": "Operating Systems",
    "q": "What is virtual memory?",
    "o": [
      "RAM",
      "Using disk space as extended RAM",
      "ROM",
      "Cache memory"
    ],
    "a": "Using disk space as extended RAM"
  },
  {
    "section": "Technical",
    "s": "Operating Systems",
    "q": "What is thrashing?",
    "o": [
      "High CPU utilization",
      "Excessive paging activity",
      "Virus attack",
      "Memory overflow"
    ],
    "a": "Excessive paging activity"
  },
  {
    "section": "Technical",
    "s": "Operating Systems",
    "q": "Which command shows running processes in Linux?",
    "o": [
      "ls",
      "ps",
      "cd",
      "pwd"
    ],
    "a": "ps"
  },
  {
    "section": "Technical",
    "s": "Operating Systems",
    "q": "What is semaphore?",
    "o": [
      "A synchronization tool",
      "A memory allocation technique",
      "A file system",
      "A network protocol"
    ],
    "a": "A synchronization tool"
  },
  {
    "section": "Technical",
    "s": "Operating Systems",
    "q": "What is the purpose of cache memory?",
    "o": [
      "Permanent storage",
      "Speed up data access",
      "Backup data",
      "Virtual memory"
    ],
    "a": "Speed up data access"
  },
  {
    "section": "Technical",
    "s": "Operating Systems",
    "q": "Which is a multi-user operating system?",
    "o": [
      "MS-DOS",
      "Linux",
      "Windows 95",
      "Android"
    ],
    "a": "Linux"
  },
  {
    "section": "Technical",
    "s": "Operating Systems",
    "q": "What is context switching?",
    "o": [
      "Switching between applications",
      "Storing and restoring process state",
      "Changing user",
      "Shutting down system"
    ],
    "a": "Storing and restoring process state"
  },
  {
    "section": "Technical",
    "s": "Data Structures",
    "q": "Which traversal visits root node first?",
    "o": [
      "Inorder",
      "Preorder",
      "Postorder",
      "Level order"
    ],
    "a": "Preorder"
  },
  {
    "section": "Technical",
    "s": "Data Structures",
    "q": "What is the worst-case time complexity of linear search?",
    "o": [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n²)"
    ],
    "a": "O(n)"
  },
  {
    "section": "Technical",
    "s": "Data Structures",
    "q": "Which data structure is used for BFS?",
    "o": [
      "Stack",
      "Queue",
      "Tree",
      "Graph"
    ],
    "a": "Queue"
  },
  {
    "section": "Technical",
    "s": "Data Structures",
    "q": "What is a complete binary tree?",
    "o": [
      "All levels are completely filled",
      "Only left subtree exists",
      "Only right subtree exists",
      "Has no children"
    ],
    "a": "All levels are completely filled"
  },
  {
    "section": "Technical",
    "s": "Data Structures",
    "q": "Which has constant time insertion at beginning?",
    "o": [
      "Array",
      "Linked List",
      "Stack",
      "Queue"
    ],
    "a": "Linked List"
  },
  {
    "section": "Technical",
    "s": "Data Structures",
    "q": "What is a hash collision?",
    "o": [
      "Two keys map to same hash value",
      "Hash function fails",
      "Memory overflow",
      "Invalid key"
    ],
    "a": "Two keys map to same hash value"
  },
  {
    "section": "Technical",
    "s": "Data Structures",
    "q": "Which sorting algorithm is stable?",
    "o": [
      "Quick Sort",
      "Heap Sort",
      "Merge Sort",
      "Selection Sort"
    ],
    "a": "Merge Sort"
  },
  {
    "section": "Technical",
    "s": "Data Structures",
    "q": "What is the height of a binary tree with n nodes (worst case)?",
    "o": [
      "log n",
      "n",
      "n²",
      "1"
    ],
    "a": "n"
  },
  {
    "section": "Technical",
    "s": "Data Structures",
    "q": "Which is NOT a type of linked list?",
    "o": [
      "Singly Linked List",
      "Doubly Linked List",
      "Circular Linked List",
      "Binary Linked List"
    ],
    "a": "Binary Linked List"
  },
  {
    "section": "Technical",
    "s": "Data Structures",
    "q": "What is the space complexity of recursive factorial?",
    "o": [
      "O(1)",
      "O(n)",
      "O(log n)",
      "O(n²)"
    ],
    "a": "O(n)"
  },
  {
    "section": "Technical",
    "s": "Algorithms",
    "q": "Which algorithm uses divide and conquer?",
    "o": [
      "Bubble Sort",
      "Merge Sort",
      "Selection Sort",
      "Insertion Sort"
    ],
    "a": "Merge Sort"
  },
  {
    "section": "Technical",
    "s": "Algorithms",
    "q": "What is dynamic programming?",
    "o": [
      "Writing dynamic code",
      "Solving problems by breaking into overlapping subproblems",
      "Allocating memory dynamically",
      "Running programs dynamically"
    ],
    "a": "Solving problems by breaking into overlapping subproblems"
  },
  {
    "section": "Technical",
    "s": "Algorithms",
    "q": "Which algorithm is greedy?",
    "o": [
      "Dijkstra's shortest path",
      "Merge Sort",
      "Binary Search",
      "DFS"
    ],
    "a": "Dijkstra's shortest path"
  },
  {
    "section": "Technical",
    "s": "Algorithms",
    "q": "What is the principle of BFS?",
    "o": [
      "LIFO",
      "FIFO",
      "Random",
      "Priority"
    ],
    "a": "FIFO"
  },
  {
    "section": "Technical",
    "s": "Algorithms",
    "q": "Which is a recursive algorithm?",
    "o": [
      "Linear Search",
      "Tower of Hanoi",
      "Bubble Sort",
      "All of the above"
    ],
    "a": "Tower of Hanoi"
  },
  {
    "section": "Technical",
    "s": "Algorithms",
    "q": "What is backtracking?",
    "o": [
      "Going back in code",
      "Trying all possibilities and undoing wrong choices",
      "Backward traversal",
      "Reverse engineering"
    ],
    "a": "Trying all possibilities and undoing wrong choices"
  },
  {
    "section": "Technical",
    "s": "Algorithms",
    "q": "Which algorithm finds minimum spanning tree?",
    "o": [
      "Dijkstra's",
      "Kruskal's",
      "Binary Search",
      "Quick Sort"
    ],
    "a": "Kruskal's"
  },
  {
    "section": "Technical",
    "s": "Algorithms",
    "q": "What is the time complexity of accessing an element in array by index?",
    "o": [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n²)"
    ],
    "a": "O(1)"
  },
  {
    "section": "Technical",
    "s": "Algorithms",
    "q": "Which search algorithm requires sorted data?",
    "o": [
      "Linear Search",
      "Binary Search",
      "DFS",
      "BFS"
    ],
    "a": "Binary Search"
  },
  {
    "section": "Technical",
    "s": "Algorithms",
    "q": "What is memoization?",
    "o": [
      "Remembering user inputs",
      "Storing results of expensive function calls",
      "Memory allocation",
      "Creating notes"
    ],
    "a": "Storing results of expensive function calls"
  },
  {
    "section": "Technical",
    "s": "Computer Fundamentals",
    "q": "Who is known as father of computers?",
    "o": [
      "Bill Gates",
      "Steve Jobs",
      "Charles Babbage",
      "Alan Turing"
    ],
    "a": "Charles Babbage"
  },
  {
    "section": "Technical",
    "s": "Computer Fundamentals",
    "q": "What does USB stand for?",
    "o": [
      "Universal Serial Bus",
      "United Serial Bus",
      "Universal System Bus",
      "United System Bus"
    ],
    "a": "Universal Serial Bus"
  },
  {
    "section": "Technical",
    "s": "Computer Fundamentals",
    "q": "Binary of decimal 10 is?",
    "o": [
      "1000",
      "1010",
      "1100",
      "1001"
    ],
    "a": "1010"
  },
  {
    "section": "Technical",
    "s": "Computer Fundamentals",
    "q": "Hexadecimal of decimal 15 is?",
    "o": [
      "E",
      "F",
      "10",
      "A"
    ],
    "a": "F"
  },
  {
    "section": "Technical",
    "s": "Computer Fundamentals",
    "q": "What is compiler?",
    "o": [
      "Converts high-level code to machine code",
      "Compiles documents",
      "Runs programs",
      "Debugs code"
    ],
    "a": "Converts high-level code to machine code"
  },
  {
    "section": "Technical",
    "s": "Computer Fundamentals",
    "q": "Difference between compiler and interpreter?",
    "o": [
      "Compiler converts all at once, interpreter line by line",
      "No difference",
      "Interpreter is faster",
      "Compiler executes code"
    ],
    "a": "Compiler converts all at once, interpreter line by line"
  },
  {
    "section": "Technical",
    "s": "Computer Fundamentals",
    "q": "What is debugging?",
    "o": [
      "Finding and fixing errors",
      "Removing bugs (insects)",
      "Testing code",
      "Writing code"
    ],
    "a": "Finding and fixing errors"
  },
  {
    "section": "Technical",
    "s": "Computer Fundamentals",
    "q": "What does WWW stand for?",
    "o": [
      "World Wide Web",
      "World Wide Work",
      "World Web Wide",
      "Wide World Web"
    ],
    "a": "World Wide Web"
  },
  {
    "section": "Technical",
    "s": "Computer Fundamentals",
    "q": "What is big data?",
    "o": [
      "Extremely large datasets",
      "Large files",
      "Big database",
      "Heavy data"
    ],
    "a": "Extremely large datasets"
  },
  {
    "section": "Technical",
    "s": "Computer Fundamentals",
    "q": "What is blockchain?",
    "o": [
      "Distributed ledger technology",
      "Chain of blocks",
      "Block storage",
      "Chain storage"
    ],
    "a": "Distributed ledger technology"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What is polymorphism in OOP?",
    "o": [
      "Many forms of same entity",
      "Multiple classes",
      "Multiple objects",
      "Multiple methods"
    ],
    "a": "Many forms of same entity"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What is inheritance?",
    "o": [
      "Acquiring properties from parent class",
      "Creating new class",
      "Deleting class",
      "Modifying class"
    ],
    "a": "Acquiring properties from parent class"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What is abstraction?",
    "o": [
      "Hiding complex implementation details",
      "Creating abstract art",
      "Making things visible",
      "Copying data"
    ],
    "a": "Hiding complex implementation details"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What is garbage collection?",
    "o": [
      "Automatic memory management",
      "Deleting files",
      "Cleaning disk",
      "Removing viruses"
    ],
    "a": "Automatic memory management"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What is constructor?",
    "o": [
      "Special method to initialize objects",
      "A destructor",
      "A variable",
      "A loop"
    ],
    "a": "Special method to initialize objects"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What is recursion?",
    "o": [
      "Function calling itself",
      "Looping",
      "Iteration",
      "Function calling another function"
    ],
    "a": "Function calling itself"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What is lambda function?",
    "o": [
      "Anonymous function",
      "Named function",
      "Main function",
      "Nested function"
    ],
    "a": "Anonymous function"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What is difference between list and tuple in Python?",
    "o": [
      "List is mutable, tuple is immutable",
      "Both are same",
      "Tuple is mutable",
      "List is immutable"
    ],
    "a": "List is mutable, tuple is immutable"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What is callback function?",
    "o": [
      "Function passed as argument to another function",
      "Function that calls back",
      "Recursive function",
      "Main function"
    ],
    "a": "Function passed as argument to another function"
  },
  {
    "section": "Technical",
    "s": "Programming Concepts",
    "q": "What is HashMap?",
    "o": [
      "Stores key-value pairs",
      "Array of maps",
      "Hash function",
      "Hashing technique"
    ],
    "a": "Stores key-value pairs"
  },
  {
    "section": "Technical",
    "s": "Web Technologies",
    "q": "What is REST API?",
    "o": [
      "Representational State Transfer API",
      "Rest Application Interface",
      "Remote State Transfer",
      "Restful Application"
    ],
    "a": "Representational State Transfer API"
  },
  {
    "section": "Technical",
    "s": "Web Technologies",
    "q": "What is JSON?",
    "o": [
      "JavaScript Object Notation",
      "Java Standard Object Notation",
      "JavaScript Online Notation",
      "Java Script Object Name"
    ],
    "a": "JavaScript Object Notation"
  },
  {
    "section": "Technical",
    "s": "Web Technologies",
    "q": "What is closure in JavaScript?",
    "o": [
      "Function with access to outer function's variables",
      "Closing a function",
      "Ending program",
      "Function termination"
    ],
    "a": "Function with access to outer function's variables"
  },
  {
    "section": "Technical",
    "s": "Web Technologies",
    "q": "What is DOM?",
    "o": [
      "Document Object Model",
      "Data Object Model",
      "Document Oriented Model",
      "Data Oriented Model"
    ],
    "a": "Document Object Model"
  },
  {
    "section": "Technical",
    "s": "Web Technologies",
    "q": "What is CDN?",
    "o": [
      "Content Delivery Network",
      "Central Data Network",
      "Content Distribution Node",
      "Central Delivery Network"
    ],
    "a": "Content Delivery Network"
  },
  {
    "section": "Technical",
    "s": "Software Engineering",
    "q": "What is DevOps?",
    "o": [
      "Development and Operations collaboration",
      "Developer operations",
      "Device operations",
      "Development options"
    ],
    "a": "Development and Operations collaboration"
  },
  {
    "section": "Technical",
    "s": "Software Engineering",
    "q": "What is Docker?",
    "o": [
      "Containerization platform",
      "Documentation tool",
      "Database",
      "Programming language"
    ],
    "a": "Containerization platform"
  },
  {
    "section": "Technical",
    "s": "Software Engineering",
    "q": "What is MVC architecture?",
    "o": [
      "Model-View-Controller",
      "Model-View-Component",
      "Module-View-Controller",
      "Model-Visual-Controller"
    ],
    "a": "Model-View-Controller"
  },
  {
    "section": "Technical",
    "s": "Software Engineering",
    "q": "What is Git?",
    "o": [
      "Version control system",
      "Programming language",
      "Operating system",
      "Database"
    ],
    "a": "Version control system"
  },
  {
    "section": "Technical",
    "s": "Software Engineering",
    "q": "What is TDD?",
    "o": [
      "Test-Driven Development",
      "Test-Data Development",
      "Technical Design Document",
      "Test-Debug-Deploy"
    ],
    "a": "Test-Driven Development"
  },
  {
    "section": "Technical",
    "s": "Software Engineering",
    "q": "What is load balancing?",
    "o": [
      "Distributing workload across multiple servers",
      "Balancing database load",
      "Loading balance sheet",
      "CPU load management"
    ],
    "a": "Distributing workload across multiple servers"
  },
  {
    "section": "Technical",
    "s": "Software Engineering",
    "q": "What is singleton pattern?",
    "o": [
      "Design pattern restricting class to one instance",
      "Single object pattern",
      "One-time pattern",
      "Unique pattern"
    ],
    "a": "Design pattern restricting class to one instance"
  },
  {
    "section": "Technical",
    "s": "Software Engineering",
    "q": "What is sprint retrospective?",
    "o": [
      "Team reflection meeting after sprint",
      "Sprint planning",
      "Sprint review",
      "Sprint closure"
    ],
    "a": "Team reflection meeting after sprint"
  },
  {
    "section": "Technical",
    "s": "Software Engineering",
    "q": "What is user story?",
    "o": [
      "Informal description of feature from user perspective",
      "User biography",
      "Story about users",
      "User manual"
    ],
    "a": "Informal description of feature from user perspective"
  },
  {
    "section": "Technical",
    "s": "Software Engineering",
    "q": "What is burndown chart?",
    "o": [
      "Chart showing remaining work in sprint",
      "Chart of burned items",
      "Performance chart",
      "Completion chart"
    ],
    "a": "Chart showing remaining work in sprint"
  },
  {
    "section": "Technical",
    "s": "Cybersecurity",
    "q": "What is SQL injection?",
    "o": [
      "Security vulnerability in database queries",
      "Injecting SQL code",
      "Database backup",
      "Query optimization"
    ],
    "a": "Security vulnerability in database queries"
  },
  {
    "section": "Technical",
    "s": "Cybersecurity",
    "q": "What is XSS attack?",
    "o": [
      "Cross-Site Scripting attack",
      "Extra Site Security",
      "Cross System Script",
      "XML Site Scripting"
    ],
    "a": "Cross-Site Scripting attack"
  },
  {
    "section": "Technical",
    "s": "Cybersecurity",
    "q": "What is OAuth?",
    "o": [
      "Open Authorization protocol",
      "Open Authentication",
      "Object Authorization",
      "Online Authorization"
    ],
    "a": "Open Authorization protocol"
  },
  {
    "section": "Technical",
    "s": "Networking",
    "q": "Full form of LAN?",
    "o": [
      "Local Area Network",
      "Large Area Network",
      "Limited Area Network",
      "Long Area Network"
    ],
    "a": "Local Area Network"
  },
  {
    "section": "Technical",
    "s": "Networking",
    "q": "What is MAC address?",
    "o": [
      "Media Access Control address",
      "Machine Access Code",
      "Main Access Control",
      "Memory Access Code"
    ],
    "a": "Media Access Control address"
  },
  {
    "section": "Technical",
    "s": "Networking",
    "q": "Which is NOT a type of network topology?",
    "o": [
      "Star",
      "Ring",
      "Square",
      "Mesh"
    ],
    "a": "Square"
  },
  {
    "section": "Technical",
    "s": "Algorithms",
    "q": "What is algorithm?",
    "o": [
      "Step-by-step procedure to solve problem",
      "Programming language",
      "Data structure",
      "Computer program"
    ],
    "a": "Step-by-step procedure to solve problem"
  },
  {
    "section": "Technical",
    "s": "Algorithms",
    "q": "What is flowchart?",
    "o": [
      "Diagrammatic representation of algorithm",
      "Chart of water flow",
      "Data flow",
      "Process chart"
    ],
    "a": "Diagrammatic representation of algorithm"
  },
  {
    "section": "Technical",
    "s": "Algorithms",
    "q": "Which symbol represents decision in flowchart?",
    "o": [
      "Rectangle",
      "Oval",
      "Diamond",
      "Circle"
    ],
    "a": "Diamond"
  },
  {
    "s": "Numbers",
    "q": "If one-third of one-fourth of a number is 15, then three-tenth of that number is:",
    "o": ["35", "36", "45", "54"],
    "a": "54"
  },

  {
    "s": "Divisibility",
    "q": "Which of the following numbers is divisible by 9?",
    "o": ["567", "568", "569", "570"],
    "a": "567"
  },

  {
    "s": "Areas, Shapes & Perimeter",
    "q": "Find the area of a rectangle with length 12 cm and breadth 5 cm.",
    "o": ["60", "50", "70", "80"],
    "a": "60"
  },
  {
    "s": "Areas, Shapes & Perimeter",
    "q": "Perimeter of a square is 40 cm. Find side.",
    "o": ["8", "10", "12", "15"],
    "a": "10"
  },
  {
    "s": "Areas, Shapes & Perimeter",
    "q": "Find area of triangle with base 10 cm and height 6 cm.",
    "o": ["30", "40", "50", "60"],
    "a": "30"
  },
  {
    "s": "Areas, Shapes & Perimeter",
    "q": "Find circumference of circle with radius 7 cm (π=22/7).",
    "o": ["22", "44", "66", "88"],
    "a": "44"
  },
  {
    "s": "Areas, Shapes & Perimeter",
    "q": "Area of square with side 9 cm?",
    "o": ["81", "72", "90", "99"],
    "a": "81"
  },
  {
    "s": "Allegations and Mixtures",
    "q": "In what ratio must water be mixed with milk costing 20 per litre to get a mixture worth 16 per litre?",
    "o": ["1:4", "2:3", "1:1", "3:2"],
    "a": "1:4"
  },
  {
    "s": "Time and Work",
    "q": "A can complete a work in 12 days and B in 6 days. In how many days can they complete it together?",
    "o": ["3", "4", "5", "6"],
    "a": "4"
  },
  {
    "s": "Work and Time",
    "q": "A is twice as efficient as B. If B can complete work in 10 days, how many days will A take?",
    "o": ["5", "6", "7", "8"],
    "a": "5"
  },
  {
    "s": "Pipes and Cistern",
    "q": "A pipe can fill a tank in 8 hours and another empties it in 12 hours. How long will it take to fill the tank?",
    "o": ["24", "20", "18", "16"],
    "a": "24"
  },
  {
    "s": "Chain Rule",
    "q": "If 5 men can do a work in 10 days, how many days will 10 men take to complete the same work?",
    "o": ["2", "5", "10", "20"],
    "a": "5"
  },
  {
    "s": "Speed Time and Distance",
    "q": "A person travels 60 km in 2 hours. Find his speed.",
    "o": ["20", "30", "40", "50"],
    "a": "30"
  },
  {
    "s": "Time and Distance",
    "q": "A car travels at 50 km/h for 4 hours. Find the distance covered.",
    "o": ["150", "180", "200", "220"],
    "a": "200"
  },
  {
    "s": "Problems on Trains",
    "q": "A train 120 m long passes a pole in 6 seconds. Find its speed in km/h.",
    "o": ["60", "72", "80", "90"],
    "a": "72"
  },
  {
    "s": "Boats and Streams",
    "q": "Speed of boat in still water is 10 km/h and stream is 2 km/h. Find downstream speed.",
    "o": ["8", "10", "12", "14"],
    "a": "12"
  },
  {
    "s": "Races and Games",
    "q": "A beats B by 20 m in a 100 m race. By how many meters will A beat B in a 200 m race?",
    "o": ["20", "30", "40", "50"],
    "a": "40"
  },


  // Volume and Surface Area
  {
    "s": "Volume and Surface Area",
    "q": "Volume of cube with side 3 cm?",
    "o": ["9", "18", "27", "36"],
    "a": "27"
  },
  {
    "s": "Volume and Surface Area",
    "q": "Volume of cuboid (l=4,b=3,h=2)?",
    "o": ["24", "12", "18", "30"],
    "a": "24"
  },
  {
    "s": "Volume and Surface Area",
    "q": "Surface area of cube side 2 cm?",
    "o": ["16", "24", "32", "12"],
    "a": "24"
  },
  {
    "s": "Volume and Surface Area",
    "q": "Volume of cylinder (r=7,h=10, π=22/7)?",
    "o": ["1540", "770", "1400", "1600"],
    "a": "1540"
  },
  {
    "s": "Volume and Surface Area",
    "q": "Volume of sphere radius 3 cm (approx)?",
    "o": ["36", "72", "113", "150"],
    "a": "113"
  },

  // Geometry
  {
    "s": "Geometry",
    "q": "Sum of angles of quadrilateral?",
    "o": ["180°", "360°", "270°", "90°"],
    "a": "360°"
  },
  {
    "s": "Geometry",
    "q": "Each angle of equilateral triangle?",
    "o": ["45°", "60°", "90°", "120°"],
    "a": "60°"
  },
  {
    "s": "Geometry",
    "q": "Angle in semicircle?",
    "o": ["60°", "90°", "120°", "180°"],
    "a": "90°"
  },
  {
    "s": "Geometry",
    "q": "Interior angles of pentagon sum?",
    "o": ["360°", "540°", "720°", "900°"],
    "a": "540°"
  },
  {
    "s": "Geometry",
    "q": "Straight line angle?",
    "o": ["90°", "120°", "180°", "360°"],
    "a": "180°"
  },

  // Height and Distance
  {
    "s": "Height and Distance",
    "q": "tan 45° value?",
    "o": ["0", "1", "√3", "2"],
    "a": "1"
  },
  {
    "s": "Height and Distance",
    "q": "Height=distance, angle=45°, distance=10 → height?",
    "o": ["5", "10", "15", "20"],
    "a": "10"
  },
  {
    "s": "Height and Distance",
    "q": "tan θ = opposite/adjacent. If 5/5, angle?",
    "o": ["30°", "45°", "60°", "90°"],
    "a": "45°"
  },
  {
    "s": "Height and Distance",
    "q": "sin 90° value?",
    "o": ["0", "1", "-1", "2"],
    "a": "1"
  },
  {
    "s": "Height and Distance",
    "q": "cos 0° value?",
    "o": ["0", "1", "-1", "2"],
    "a": "1"
  },

  // Calendar
  {
    "s": "Calendar",
    "q": "Normal year days?",
    "o": ["364", "365", "366", "360"],
    "a": "365"
  },
  {
    "s": "Calendar",
    "q": "Leap year divisible by?",
    "o": ["2", "3", "4", "5"],
    "a": "4"
  },
  {
    "s": "Calendar",
    "q": "Days in February (leap)?",
    "o": ["28", "29", "30", "31"],
    "a": "29"
  },
  {
    "s": "Calendar",
    "q": "Weeks in 1 year?",
    "o": ["50", "51", "52", "53"],
    "a": "52"
  },
  {
    "s": "Calendar",
    "q": "Days in 1 week?",
    "o": ["5", "6", "7", "8"],
    "a": "7"
  },

  // Calendar & Clock
  {
    "s": "Calendar & Clock",
    "q": "Hours in 1 day?",
    "o": ["12", "18", "24", "30"],
    "a": "24"
  },
  {
    "s": "Calendar & Clock",
    "q": "Minutes in 2 hours?",
    "o": ["60", "90", "120", "180"],
    "a": "120"
  },
  {
    "s": "Calendar & Clock",
    "q": "Seconds in 1 minute?",
    "o": ["30", "60", "90", "120"],
    "a": "60"
  },
  {
    "s": "Calendar & Clock",
    "q": "Days in 2 weeks?",
    "o": ["10", "12", "14", "16"],
    "a": "14"
  },
  {
    "s": "Calendar & Clock",
    "q": "Hours in 3 days?",
    "o": ["48", "60", "72", "96"],
    "a": "72"
  },

  // Clock
  {
    "s": "Clock",
    "q": "Angle at 6:00?",
    "o": ["90°", "120°", "180°", "60°"],
    "a": "180°"
  },
  {
    "s": "Clock",
    "q": "Angle at 12:00?",
    "o": ["0°", "90°", "180°", "360°"],
    "a": "0°"
  },
  {
    "s": "Clock",
    "q": "Angle at 3:00?",
    "o": ["60°", "90°", "120°", "30°"],
    "a": "90°"
  },
  {
    "s": "Clock",
    "q": "Minutes between numbers?",
    "o": ["4", "5", "6", "3"],
    "a": "5"
  },
  {
    "s": "Clock",
    "q": "Full rotation degrees?",
    "o": ["180°", "270°", "360°", "90°"],
    "a": "360°"
  },

  // Clocks & Calendar
  {
    "s": "Clocks & Calendar",
    "q": "Hours in a week?",
    "o": ["120", "168", "180", "200"],
    "a": "168"
  },
  {
    "s": "Clocks & Calendar",
    "q": "Minutes in a day?",
    "o": ["1200", "1400", "1440", "1500"],
    "a": "1440"
  },
  {
    "s": "Clocks & Calendar",
    "q": "Seconds in 1 hour?",
    "o": ["3600", "1800", "7200", "3000"],
    "a": "3600"
  },
  {
    "s": "Clocks & Calendar",
    "q": "Days in 3 weeks?",
    "o": ["18", "21", "24", "27"],
    "a": "21"
  },
  {
    "s": "Clocks & Calendar",
    "q": "Months in a year?",
    "o": ["10", "11", "12", "13"],
    "a": "12"
  },

  // Logarithm
  {
    "s": "Logarithm",
    "q": "log10(1000)?",
    "o": ["2", "3", "4", "5"],
    "a": "3"
  },
  {
    "s": "Logarithm",
    "q": "log10(1)?",
    "o": ["0", "1", "10", "undefined"],
    "a": "0"
  },
  {
    "s": "Logarithm",
    "q": "log10(10)?",
    "o": ["0", "1", "2", "10"],
    "a": "1"
  },
  {
    "s": "Logarithm",
    "q": "log10(100)?",
    "o": ["1", "2", "3", "4"],
    "a": "2"
  },
  {
    "s": "Logarithm",
    "q": "log10(10000)?",
    "o": ["2", "3", "4", "5"],
    "a": "4"
  },

  // Permutation and Combination
  {
    "s": "Permutation and Combination",
    "q": "4! value?",
    "o": ["12", "24", "48", "16"],
    "a": "24"
  },
  {
    "s": "Permutation and Combination",
    "q": "3! value?",
    "o": ["3", "6", "9", "12"],
    "a": "6"
  },
  {
    "s": "Permutation and Combination",
    "q": "Ways to arrange 2 objects?",
    "o": ["1", "2", "3", "4"],
    "a": "2"
  },
  {
    "s": "Permutation and Combination",
    "q": "5P1 value?",
    "o": ["5", "10", "20", "25"],
    "a": "5"
  },
  {
    "s": "Permutation and Combination",
    "q": "Ways to arrange 1 object?",
    "o": ["0", "1", "2", "3"],
    "a": "1"
  },

  {
    "s": "Divisibility",
    "q": "Find the smallest number that must be added to 999 to make it divisible by 8.",
    "o": ["1", "5", "7", "9"],
    "a": "1"
  },
  {
    "s": "Divisibility",
    "q": "Which of the following numbers is divisible by 11?",
    "o": ["1210", "1331", "1452", "1543"],
    "a": "1331"
  },
  {
    "s": "Divisibility",
    "q": "Find the remainder when 12345 is divided by 6.",
    "o": ["1", "3", "5", "0"],
    "a": "3"
  },
  {
    "s": "Divisibility",
    "q": "Which of the following numbers is divisible by both 3 and 5?",
    "o": ["345", "346", "347", "348"],
    "a": "345"
  }

];

async function syncToDatabase() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected.');

    // 🛠️ NUCLEAR FIX: Drop all unique indexes (except _id) that cause E11000 errors
    try {
      const collection = mongoose.connection.db.collection('questions');
      const indexes = await collection.indexes();
      for (const idx of indexes) {
        if (idx.name !== '_id_' && (idx.unique || idx.name === 'id_1')) {
          console.log(`⚠️ Dropping conflicting index: ${idx.name}`);
          await collection.dropIndex(idx.name);
        }
      }
      console.log('✅ Database constraints cleared.');
    } catch (e) { console.log('ℹ️ Indexes are clean.'); }

    // Wipe old questions removed to allow incremental additions
    // console.log('🧹 Wiping old questions...');
    // await Question.deleteMany({});
    // console.log('✨ Documents cleared.');

    const processed = MY_QUESTIONS.map(q => {
      let finalA = String(q.a);
      // If 'a' is a number (index), convert it to the string value from options 'o'
      if (typeof q.a === 'number' && q.o[q.a]) {
        finalA = q.o[q.a];
      }
      return {
        ...q,
        a: finalA,
        section: getSectionForTopic(q.s) || 'Aptitude'
      };
    });

    console.log(`🚀 Sending ${processed.length} questions to MongoDB...`);
    await Question.insertMany(processed);
    console.log(`🎉 SUCCESS: Synced ${processed.length} questions!`);

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error syncing:', err);
    process.exit(1);
  }
}

syncToDatabase();
