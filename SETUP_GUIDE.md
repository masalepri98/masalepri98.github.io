# Setup Guide for Your Security Portfolio Blog

## Google Analytics Setup

Your blog is now configured to use Google Analytics 4 (GA4). Follow these steps to get it working:

### Step 1: Create a Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click **"Start measuring"** or **"Admin"** (gear icon)
4. Create a new **Account** (name it something like "Security Portfolio")
5. Create a new **Property** (name it "masalepri98.github.io" or your custom domain)
6. Select your time zone and currency
7. Click **"Create"**

### Step 2: Set Up a Data Stream

1. After creating the property, you'll be prompted to set up a data stream
2. Select **"Web"**
3. Enter your website URL: `https://masalepri98.github.io` (or your custom domain)
4. Give it a name: "Portfolio Blog"
5. Click **"Create stream"**

### Step 3: Get Your Measurement ID

1. After creating the stream, you'll see a **Measurement ID** that looks like: `G-XXXXXXXXXX`
2. Copy this ID

### Step 4: Add the ID to Your Blog

1. Open `_config.yml` in your repository
2. Find the line that says `google_analytics:`
3. Replace it with your Measurement ID:
   ```yaml
   google_analytics: G-XXXXXXXXXX
   ```
4. Commit and push the change:
   ```bash
   git add _config.yml
   git commit -m "Add Google Analytics tracking"
   git push origin master
   ```

### Step 5: Verify It's Working

1. Wait 5-10 minutes after pushing your changes
2. Visit your blog: https://masalepri98.github.io
3. In Google Analytics, go to **Reports** → **Realtime**
4. You should see yourself as an active user!

---

## Custom Domain Setup

Want to use your own domain (like `masonprince.com` or `security.masonprince.com`)? Here's how:

### Option 1: Apex Domain (example.com)

**Step 1: Configure GitHub Pages**

1. Go to your repository on GitHub: `https://github.com/masalepri98/masalepri98.github.io`
2. Go to **Settings** → **Pages**
3. Under **Custom domain**, enter your domain (e.g., `masonprince.com`)
4. Check **Enforce HTTPS** (you may need to wait a bit before this option is available)
5. Click **Save**

**Step 2: Configure Your DNS Provider**

Add these DNS records at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

```
Type    Name    Value                       TTL
A       @       185.199.108.153             3600
A       @       185.199.109.153             3600
A       @       185.199.110.153             3600
A       @       185.199.111.153             3600
CNAME   www     masalepri98.github.io       3600
```

**Note:** The `@` symbol represents your root domain.

**Step 3: Update Your Config**

Edit `_config.yml`:
```yaml
url: https://masonprince.com
```

### Option 2: Subdomain (blog.example.com or security.example.com)

**Step 1: Configure GitHub Pages**

1. Go to **Settings** → **Pages** in your GitHub repository
2. Under **Custom domain**, enter your subdomain (e.g., `blog.masonprince.com`)
3. Check **Enforce HTTPS**
4. Click **Save**

**Step 2: Configure Your DNS Provider**

Add this single CNAME record:

```
Type    Name    Value                       TTL
CNAME   blog    masalepri98.github.io.      3600
```

(Replace `blog` with whatever subdomain you want: `security`, `portfolio`, etc.)

**Step 3: Update Your Config**

Edit `_config.yml`:
```yaml
url: https://blog.masonprince.com
```

### Popular Domain Registrars - Where to Change DNS

- **GoDaddy**: My Products → Domain → DNS → Manage DNS
- **Namecheap**: Domain List → Manage → Advanced DNS
- **Google Domains**: My domains → DNS
- **Cloudflare**: Select your domain → DNS
- **Hover**: Select your domain → DNS

### Important Notes

1. **DNS Propagation**: Changes can take 24-48 hours to propagate worldwide, but usually work within 1-2 hours
2. **HTTPS**: GitHub Pages will automatically provision an SSL certificate for your custom domain (this can take a few minutes)
3. **CNAME File**: GitHub will automatically create a `CNAME` file in your repository - don't delete it!
4. **WWW Redirect**: If you use an apex domain, the www subdomain will automatically redirect to your main domain

### Verification

To check if your DNS is configured correctly:

```bash
# For apex domain
dig masonprince.com +noall +answer

# For subdomain
dig blog.masonprince.com +noall +answer
```

Or use online tools:
- https://www.whatsmydns.net/
- https://dnschecker.org/

---

## Recommended Custom Domain Options for Security Portfolio

Here are some good domain name ideas for a security portfolio:

**Professional:**
- `masonprince.com` - Your personal brand
- `masonprince.io` - Tech-focused TLD
- `masonprince.security` - If available

**Creative:**
- `hackdjinn.com` - Matches your logo/brand
- `princepentest.com`
- `masonsec.com`

**Subdomain Options (if you have an existing domain):**
- `blog.yourdomain.com`
- `security.yourdomain.com`
- `research.yourdomain.com`
- `ctf.yourdomain.com`

---

## Need Help?

- **GitHub Pages Documentation**: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- **Google Analytics Help**: https://support.google.com/analytics/
- **DNS Issues**: Use https://www.whatsmydns.net/ to check propagation

---

## Quick Reference: Files to Update

When setting up custom domain and analytics:

1. `_config.yml` - Add GA tracking ID and update URL
2. DNS settings at your registrar
3. GitHub Pages settings in repository

That's it! Your portfolio will be even more professional with analytics tracking and a custom domain.
