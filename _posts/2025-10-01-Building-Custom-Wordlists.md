---
layout: post
title: "Building Custom Wordlists for Targeted Attacks"
categories: [Tutorials, Penetration Testing]
tags: [wordlists, osint, password-cracking, bruteforce, reconnaissance]
---

One of the most overlooked aspects of penetration testing is wordlist creation. While generic wordlists like `rockyou.txt` are useful, custom wordlists tailored to your target dramatically increase your success rate for password attacks, directory brute-forcing, and subdomain enumeration. Let me show you how to build effective custom wordlists.

## Why Custom Wordlists Matter

**The Problem with Generic Wordlists:**
- Too large, causing slow enumeration
- Not specific to the target
- Low hit rate on modern, complex passwords

**Benefits of Custom Wordlists:**
- Higher success rate
- Faster enumeration
- More realistic to actual user behavior
- Better for time-constrained engagements

## Gathering Intelligence for Wordlist Creation

### 1. OSINT - Open Source Intelligence

Start by collecting information about your target:

```bash
# Company information
- Company name and variations
- Product names
- Location (cities, states, countries)
- Industry-specific terms
- Employee names (LinkedIn, company website)
- Acquisition/merger history
- Founding year

# From the target website
- Technologies used
- Department names
- Project names
- Internal jargon
```

### 2. Web Scraping

Use `cewl` to spider the target's website and extract words:

```bash
# Basic usage
cewl -w wordlist.txt -d 2 -m 5 https://target.com

# With authentication
cewl -w wordlist.txt -d 3 -m 5 --auth_type digest --auth_user admin --auth_pass password https://target.com

# Include email addresses
cewl -w wordlist.txt -e --email_file emails.txt https://target.com
```

**Parameters explained:**
- `-w`: Output file
- `-d`: Spider depth
- `-m`: Minimum word length
- `-e`: Extract email addresses

### 3. Social Media Intelligence

LinkedIn is a goldmine for custom wordlists:

```python
#!/usr/bin/env python3
# linkedin_scraper.py - Educational purposes only

import re
from linkedin_api import Linkedin

def scrape_employee_names(company_name):
    """Scrape employee names for username generation"""

    # Note: Requires LinkedIn authentication
    api = Linkedin('your_email@example.com', 'your_password')

    employees = api.search_people(keywords=company_name)

    names = []
    for employee in employees:
        first = employee.get('firstName', '')
        last = employee.get('lastName', '')
        names.append({'first': first, 'last': last})

    return names

def generate_username_variations(names):
    """Generate common username formats"""

    usernames = []

    for name in names:
        first = name['first'].lower()
        last = name['last'].lower()

        # Common formats
        usernames.append(f"{first}.{last}")
        usernames.append(f"{first}{last}")
        usernames.append(f"{last}{first}")
        usernames.append(f"{first[0]}{last}")
        usernames.append(f"{first}{last[0]}")
        usernames.append(f"{last}{first[0]}")

    return list(set(usernames))

# Usage
names = scrape_employee_names("Target Company")
usernames = generate_username_variations(names)

with open('usernames.txt', 'w') as f:
    f.write('\n'.join(usernames))
```

## Building Password Wordlists

### Understanding Password Patterns

Most users follow predictable patterns:

```
[Company][Year][!/@/#]
[Season][Year]
[City/Location][Number]
[ProductName][Version]
```

### Using CUPP - Common User Password Profiler

CUPP generates custom wordlists based on target information:

```bash
git clone https://github.com/Mebus/cupp.git
cd cupp
python3 cupp.py -i
```

CUPP will ask questions about the target:
- First/Last name
- Nickname
- Birthdate
- Partner's name
- Pet's name
- Company name
- Keywords

It then generates permutations like:
```
TargetCompany2025!
TargetCompany2024!
TargetCompany@2025
targetcompany2025
```

### Advanced: Custom Password Mutation Rules

Create custom hashcat rules for target-specific mutations:

```bash
# rules/custom.rule
# Append company name
$T$a$r$g$e$t

# Prepend current year
^2^0^2^5

# Append special chars and numbers
$! $1 $2 $3
$@ $2 $0 $2 $5

# Capitalize first letter and append year
c $2$0$2$5

# Leet speak substitution
so0 si1 se3 sa4
```

Apply rules with hashcat:

```bash
hashcat -a 0 -m 1000 hashes.txt base_wordlist.txt -r rules/custom.rule
```

### Location-Based Passwords

Many organizations use location-based passwords:

```python
#!/usr/bin/env python3
# location_passwords.py

def generate_location_passwords(company_name, locations, years):
    """Generate location-based password variations"""

    passwords = []
    special_chars = ['!', '@', '#', '$']

    for location in locations:
        for year in years:
            # Basic combinations
            passwords.append(f"{company_name}{location}{year}")
            passwords.append(f"{location}{company_name}{year}")
            passwords.append(f"{location}{year}")

            # With special characters
            for char in special_chars:
                passwords.append(f"{location}{year}{char}")
                passwords.append(f"{company_name}{location}{year}{char}")

            # Capitalization variants
            passwords.append(f"{location.capitalize()}{year}")
            passwords.append(f"{location.upper()}{year}")

    return passwords

# Usage
locations = ['NewYork', 'NYC', 'Manhattan', 'HQ']
years = ['2024', '2025', '24', '25']
company = 'TargetCorp'

wordlist = generate_location_passwords(company, locations, years)

with open('location_passwords.txt', 'w') as f:
    f.write('\n'.join(wordlist))
```

## Building Directory/File Wordlists

### Technology-Specific Wordlists

If you know the target's tech stack, use relevant wordlists:

```bash
# For Java applications
/WEB-INF/web.xml
/META-INF/MANIFEST.MF
/admin/console
/management
/actuator

# For .NET applications
/web.config
/bin/
/App_Data/
/aspnet_client/

# For PHP applications
/config.php
/db.php
/admin/
/phpmyadmin/
```

### Combining Wordlists

Merge and deduplicate multiple sources:

```bash
# Combine multiple wordlists
cat wordlist1.txt wordlist2.txt wordlist3.txt > combined.txt

# Remove duplicates and sort
sort -u combined.txt -o final_wordlist.txt

# Remove words below minimum length
awk 'length($0)>5' final_wordlist.txt > filtered.txt
```

### Wordlist Manipulation with Hashcat Utils

Generate permutations with hashcat-utils:

```bash
# Combine words (combinator attack)
./combinator.bin words1.txt words2.txt > combined.txt

# Example output:
# admin + 2025 = admin2025
# password + company = passwordcompany
```

## Practical Example: Full Engagement Workflow

Let's walk through a real-world scenario:

**Target**: TechCorp Inc., a software company in Austin, Texas

**Step 1: Gather Information**
```bash
# Spider the website
cewl -w techcorp_web.txt -d 2 -m 5 https://techcorp.com

# Extract emails
cewl -e --email_file techcorp_emails.txt https://techcorp.com

# Manual research
echo -e "TechCorp\nAustin\nTexas\nATX\nSoftware\nCloud\nInnovation" > manual_words.txt
```

**Step 2: Generate Username List**
```bash
# From collected emails, extract patterns
cat techcorp_emails.txt | cut -d@ -f1 > usernames.txt

# Generate variations
# If you find john.doe@techcorp.com
# Try: jdoe, doej, johnd, j.doe, etc.
```

**Step 3: Build Password Wordlist**
```bash
# Use CUPP for basic generation
python3 cupp.py -i

# Combine all sources
cat techcorp_web.txt manual_words.txt cupp_output.txt > base_wordlist.txt

# Add year mutations
for word in $(cat base_wordlist.txt); do
    echo "${word}2024"
    echo "${word}2025"
    echo "${word}@2024"
    echo "${word}@2025"
    echo "${word}!"
done > final_wordlist.txt
```

**Step 4: Test and Refine**
```bash
# Test against found hashes or login portal
# Analyze successful passwords for patterns
# Refine wordlist based on findings
```

## Automation Script

Here's a script to automate the basic process:

```bash
#!/bin/bash
# custom_wordlist_generator.sh

TARGET_URL=$1
COMPANY_NAME=$2
OUTPUT_DIR="wordlists"

mkdir -p $OUTPUT_DIR

echo "[+] Spidering target website..."
cewl -w $OUTPUT_DIR/web_words.txt -d 2 -m 5 $TARGET_URL

echo "[+] Extracting emails..."
cewl -e --email_file $OUTPUT_DIR/emails.txt $TARGET_URL

echo "[+] Generating year-based mutations..."
YEARS=("2024" "2025" "24" "25")
SPECIAL=("!" "@" "#" "$")

while read word; do
    for year in "${YEARS[@]}"; do
        echo "${word}${year}"
        echo "${word^}${year}"
        for char in "${SPECIAL[@]}"; do
            echo "${word}${year}${char}"
        done
    done
done < $OUTPUT_DIR/web_words.txt > $OUTPUT_DIR/mutations.txt

echo "[+] Combining wordlists..."
cat $OUTPUT_DIR/web_words.txt $OUTPUT_DIR/mutations.txt | sort -u > $OUTPUT_DIR/final_wordlist.txt

echo "[+] Wordlist created: $OUTPUT_DIR/final_wordlist.txt"
wc -l $OUTPUT_DIR/final_wordlist.txt
```

**Usage:**
```bash
chmod +x custom_wordlist_generator.sh
./custom_wordlist_generator.sh https://target.com TargetCompany
```

## Best Practices

1. **Size Matters**: Balance comprehensiveness with practicality (10K-100K words is often ideal)
2. **Update Regularly**: Refresh wordlists as you learn more about the target
3. **Document Sources**: Keep track of where words came from for future reference
4. **Respect Scope**: Only use these techniques on authorized targets
5. **Test First**: Validate your wordlist on a small scale before full deployment

## Common Pitfalls to Avoid

- **Wordlists too large**: Causes slow enumeration and timeout issues
- **No deduplication**: Wastes time testing the same credentials multiple times
- **Ignoring encoding**: Some systems use UTF-8, others ASCII
- **Not considering account lockout**: Monitor for lockout policies during testing

## Tools Reference

- **CeWL**: Web spider for custom wordlist generation
- **CUPP**: Common User Password Profiler
- **Hashcat**: Password cracking with rule-based mutations
- **Crunch**: Pattern-based wordlist generator
- **TTPassGen**: Targeted password wordlist generator
- **Mentalist**: GUI-based wordlist generator

## Conclusion

Custom wordlists are a force multiplier in penetration testing. Spending an extra hour on reconnaissance and wordlist generation can save days of brute-forcing with generic wordlists. The key is understanding your target and applying that knowledge to create focused, effective wordlists.

Remember: **Quality > Quantity**. A 10,000-word targeted wordlist will outperform a 10-million-word generic wordlist every time.

---

**Resources:**
- [SecLists](https://github.com/danielmiessler/SecLists) - Collection of useful wordlists
- [CeWL Documentation](https://github.com/digininja/CeWL)
- [Hashcat Rules](https://hashcat.net/wiki/doku.php?id=rule_based_attack)

Happy hunting!
