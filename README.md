# Mason Prince - Offensive Security Portfolio

This is my personal security research blog where I share:

- **CTF Write-ups**: Detailed walkthroughs of Capture The Flag challenges from HackTheBox, TryHackMe, and various CTF competitions
- **Vulnerability Analysis**: Deep dives into CVEs, zero-days, and security incidents
- **Security Tutorials**: Practical guides for penetration testing, exploit development, and offensive security techniques
- **Research**: My own vulnerability discoveries and security research projects

## About This Blog

Built with Hugo and hosted on Cloudflare Pages, this blog serves as a portfolio for prospective employers and a knowledge-sharing platform for the security community.

### Recent Posts

Check out my latest content on offensive security, including real-world exploitation techniques, CTF solutions, and vulnerability analysis.

## Technical Details

This blog is built using:
- **[Hugo](https://gohugo.io/)**: Fast static site generator written in Go
- **[PaperMod Theme](https://github.com/adityatelange/hugo-PaperMod)**: Clean, responsive Hugo theme
- **[Cloudflare Pages](https://pages.cloudflare.com/)**: Fast, secure hosting with automatic builds
- **Markdown**: For writing posts

### Post Categories

Posts are organized into categories:
- **CTF**: Capture The Flag write-ups and walkthroughs
- **HackTheBox**: Specific HTB machine walkthroughs
- **Vulnerability Analysis**: CVE analysis and exploitation
- **Tutorials**: How-to guides and educational content
- **Penetration Testing**: Real-world pentesting insights

## Local Development

If you want to run the blog locally:

```bash
# Install Hugo (macOS)
brew install hugo

# Install Hugo (Linux)
sudo apt install hugo
# or snap install hugo

# Clone the repository (including submodules for the theme)
git clone --recurse-submodules https://github.com/masalepri98/masalepri98.github.io.git
cd masalepri98.github.io

# Run Hugo development server
hugo server -D

# View at http://localhost:1313/
```

## Writing New Posts

To create a new blog post:

```bash
# Create a new post
hugo new posts/my-new-post.md
```

Or manually create a file in `content/posts/` with front matter:

```yaml
---
title: "Your Post Title"
date: 2025-01-01
categories: [Category1, Category2]
tags: [tag1, tag2, tag3]
summary: "Brief description of the post"
---

Your content here...
```

## Cloudflare Pages Deployment

This site automatically deploys via Cloudflare Pages:

1. Push changes to the `main` branch
2. Cloudflare Pages automatically triggers a build
3. Hugo builds the static site
4. Site is deployed to the Cloudflare edge network

### Build Settings (Cloudflare Pages)

- **Build command**: `hugo`
- **Build output directory**: `public`
- **Environment variable**: `HUGO_VERSION` = `0.146.0` (required by PaperMod theme)

## Blog Post Guidelines

For consistency and professionalism:

- **CTF Write-ups**: Include methodology, tools used, and lessons learned
- **Vulnerability Analysis**: Provide technical details, impact assessment, and mitigation
- **Tutorials**: Step-by-step instructions with code examples
- **Screenshots**: Use images to illustrate concepts (stored in `/static/images/`)
- **Code Blocks**: Use syntax highlighting for all code examples
- **References**: Link to sources and additional resources

## Contact

- **Email**: mason.a.prince@gmail.com
- **Twitter**: [@MasePrace93](https://twitter.com/MasePrace93)
- **GitHub**: [masalepri98](https://github.com/masalepri98)
- **LinkedIn**: [masonaprince](https://linkedin.com/in/masonaprince)

## License

This blog content is for educational purposes. Please reference appropriately if using any content.

## Credits

- Built with [Hugo](https://gohugo.io/)
- Theme: [PaperMod](https://github.com/adityatelange/hugo-PaperMod)
- Hosted on [Cloudflare Pages](https://pages.cloudflare.com/)
