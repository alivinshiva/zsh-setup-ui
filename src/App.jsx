import { useState, useEffect } from 'react'
import './App.css'

const chars = ['$', '_', '>', '~', '#', '%', '&', '|', '/', '\\', '=', '@', '!', '?', '*']
const colors = ['#00d4ff', '#00ff88', '#ffd700', '#ff66cc', '#ff8844', '#aa66ff', '#ff4466', '#44aaff', '#66ff99', '#ffaa33', '#33ccff', '#ff5599', '#88ff66', '#dd88ff', '#ff9966']
const anims = ['float-up', 'float-down', 'float-drift-l', 'float-drift-r', 'float-diag']

const floating = chars.map((c, i) => ({
  char: c,
  color: colors[i],
  left: Math.random() * 85 + 5,
  top: Math.random() * 100,
  anim: anims[Math.floor(Math.random() * anims.length)],
  delay: Math.random() * 14,
  duration: Math.random() * 18 + 14,
  size: Math.random() * 12 + 12,
}))

const features = [
  { title: 'Powerlevel10k', desc: 'Classic prompt style with git status, execution time, virtualenv, and more.' },
  { title: 'Oh My Zsh', desc: '12 curated plugins — git, docker, npm, zoxide, extract, sudo, web-search, dirhistory & more.' },
  { title: 'Smart Navigation', desc: 'zoxide replaces cd with fuzzy muscle memory. fzf with Ctrl+R / Ctrl+T / Alt+C.' },
  { title: 'Syntax Highlighting', desc: 'Real-time zsh-syntax-highlighting + zsh-autosuggestions as you type.' },
  { title: 'Modern Aliases', desc: 'ls → eza with icons, lt → tree view, ff → fzf + bat preview.' },
  { title: 'Cross-Platform', desc: 'Same experience on macOS and Linux. Auto-detects Homebrew vs apt paths.' },
  { title: 'git-delta', desc: 'Syntax-highlighted git diffs with side-by-side navigation.' },
  { title: 'Performance', desc: 'History dedup, transient prompt, instant prompt. fastfetch on start.' },
  { title: 'NVM', desc: 'Node Version Manager pre-integrated. Switch Node versions seamlessly.' },
]

const fixes = [
  { problem: 'Setup overwrote my config', solution: 'Restore from backup: `mv ~/.zshrc.backup ~/.zshrc` and `mv ~/.p10k.zsh.backup ~/.p10k.zsh`.', link: 'https://github.com/alivinshiva/zsh-setup/blob/master/TROUBLESHOOTING.md#my-existing-zshrc--p10kzsh-got-overwritten' },
  { problem: 'Command not found: eza / bat / fd', solution: 'Tools may not be installed. Run `brew install` on macOS or `sudo apt install` on Linux. On Linux, `bat` is named `batcat` and `fd` is `fdfind`.', link: 'https://github.com/alivinshiva/zsh-setup/blob/master/TROUBLESHOOTING.md#command-not-found-eza--bat--fd--fastfetch' },
  { problem: 'Powerlevel10k prompt not showing', solution: 'Ensure the theme is cloned to `~/.oh-my-zsh/custom/themes/powerlevel10k` and you have a Nerd Font installed in your terminal.', link: 'https://github.com/alivinshiva/zsh-setup/blob/master/TROUBLESHOOTING.md#powerlevel10k-prompt-not-showing' },
  { problem: 'Syntax highlighting / suggestions not working', solution: 'Install `zsh-syntax-highlighting` and `zsh-autosuggestions` via brew or apt. The source lines must be at the end of `.zshrc`.', link: 'https://github.com/alivinshiva/zsh-setup/blob/master/TROUBLESHOOTING.md#zsh-syntax-highlighting-not-working' },
  { problem: 'NVM not working', solution: 'Install NVM with `curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash` then restart your terminal.', link: 'https://github.com/alivinshiva/zsh-setup/blob/master/TROUBLESHOOTING.md#nvm-not-working' },
  { problem: 'fzf keybindings not working', solution: 'Install fzf via brew/apt. Key binding files must exist at `/usr/share/fzf/` (Linux) or `/opt/homebrew/opt/fzf/` (macOS).', link: 'https://github.com/alivinshiva/zsh-setup/blob/master/TROUBLESHOOTING.md#fzf-key-bindings-not-working-ctrlr-ctrlt-altc' },
  { problem: 'Oh My Zsh not installed', solution: 'Run the installer: `sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended`', link: 'https://github.com/alivinshiva/zsh-setup/blob/master/TROUBLESHOOTING.md#oh-my-zsh-not-installed' },
  { problem: 'git-delta not showing diffs', solution: 'Install `git-delta` via brew/apt, then set `git config --global core.pager "delta"`.', link: 'https://github.com/alivinshiva/zsh-setup/blob/master/TROUBLESHOOTING.md#git-delta-not-showing-syntax-highlighted-diffs' },
]

const historyShortcuts = [
  { cmd: '!!', desc: 'Last command', example: '`sudo !!` — re-run previous command with sudo' },
  { cmd: '!$', desc: 'Last argument of previous command', example: '`mkdir foo && cd !$` — cd into the dir you just created' },
  { cmd: '!^', desc: 'First argument of previous command', example: '`!^` — grabs the first word of the last command' },
  { cmd: '!*', desc: 'All arguments of previous command', example: '`echo !*` — prints all args from last command' },
  { cmd: '!n', desc: 'Run the nth command from history', example: '`!42` — re-run command #42 from `history`' },
  { cmd: '!-n', desc: 'Run the command n lines back', example: '`!-3` — re-run the command 3 lines ago' },
  { cmd: '^old^new', desc: 'Quick substitution in last command', example: '`^foo^bar` — re-run last command replacing foo with bar' },
  { cmd: 'history', desc: 'Show command history', example: '`history | grep docker` — find all docker commands you ran' },
]

const customAliases = [
  { alias: 'g', cmd: 'git', desc: 'Git shortcut' },
  { alias: 'd', cmd: 'docker', desc: 'Docker shortcut' },
  { alias: 'n', cmd: 'nvim . (or nvim <file>)', desc: 'Open neovim; with no args opens current dir' },
  { alias: 'ls', cmd: 'eza -lh --group-dirs-first --icons --classify', desc: 'List files with icons, sizes, permissions' },
  { alias: 'lsa', cmd: 'ls -a', desc: 'List all files (including hidden)' },
  { alias: 'lt', cmd: 'eza --tree --level=2 --long --icons --git', desc: 'Directory tree view (2 levels deep)' },
  { alias: 'lta', cmd: 'lt -a', desc: 'Tree view including hidden files' },
  { alias: 'ff', cmd: 'fzf --preview "bat --style=numbers --color=always {}"', desc: 'Fuzzy find files with syntax-highlighted preview' },
  { alias: 'cd', cmd: 'z (zoxide)', desc: 'Smart cd — jump to any directory from anywhere' },
  { alias: '..', cmd: 'cd ..', desc: 'Go up one directory' },
  { alias: '...', cmd: 'cd ../..', desc: 'Go up two directories' },
  { alias: '....', cmd: 'cd ../../..', desc: 'Go up three directories' },
  { alias: 'gcm', cmd: 'git commit -m', desc: 'Quick git commit with message' },
  { alias: 'gcam', cmd: 'git commit -a -m', desc: 'Stage all + commit with message' },
  { alias: 'gcad', cmd: 'git commit -a --amend', desc: 'Stage all + amend last commit' },
]

const navShortcuts = [
  { cmd: '~', desc: 'Home directory', example: '`cd ~` or just `~` — go to $HOME' },
  { cmd: '-', desc: 'Previous directory', example: '`cd -` — toggle back to last directory' },
  { cmd: '~+', desc: 'Current working directory', example: '`echo ~+` — prints absolute path of pwd' },
  { cmd: '~-', desc: 'Previous working directory', example: '`cd ~-` — same as `cd -`' },
  { cmd: 'pushd <dir>', desc: 'Go to dir and push current onto stack', example: '`pushd /tmp` — saves current dir, goes to /tmp' },
  { cmd: 'popd', desc: 'Pop directory stack and go there', example: '`popd` — return to the dir saved by pushd' },
  { cmd: 'dirs', desc: 'Show directory stack', example: '`dirs -v` — numbered list of stacked directories' },
  { cmd: '~<TAB>', desc: 'Tab-complete user/visited dirs', example: '`cd ~<TAB>` — interactive completion of recent dirs' },
  { cmd: 'z <fragment>', desc: 'zoxide: jump to a matching dir', example: '`z doc` — cd to ~/Documents from anywhere' },
  { cmd: 'zi <fragment>', desc: 'zoxide: interactive selection', example: '`zi pro` — fuzzy pick from matching dirs' },
  { cmd: 'zoxide query <fragment>', desc: 'Print matching path (no cd)', example: '`zoxide query doc` — prints full path without changing dir' },
]

const testimonials = [
  { quote: 'Set up my entire dev environment in under 2 minutes. The aliases alone saved me hours of config tweaking.', author: 'Alex M.', role: 'Backend Engineer' },
  { quote: 'Switched from macOS to Linux and my terminal felt identical. Cross-platform support is a lifesaver.', author: 'Priya K.', role: 'Full-Stack Developer' },
  { quote: 'The eza + bat + fzf combination is incredible. I use ff (fzf preview) dozens of times a day now.', author: 'Jordan T.', role: 'DevOps Engineer' },
]

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('zsh-theme') || 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('zsh-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  const copyCmd = () => {
    navigator.clipboard.writeText('bash -c "$(curl -fsSL https://raw.githubusercontent.com/alivinshiva/zsh-setup/master/install.sh)"')
  }

  return (
    <>
      <div className="terminal-bg" aria-hidden="true">
        {floating.map((f, i) => (
          <span key={i} style={{ left: `${f.left}%`, top: `${f.top}%`, animationName: f.anim, animationDelay: `${f.delay}s`, animationDuration: `${f.duration}s`, color: f.color, fontSize: `${f.size}px` }}>{f.char}</span>
        ))}
      </div>

      <nav className="navbar">
        <div className="navbar-inner">
          <a href="#hero" className="navbar-brand">zsh-setup</a>
          <div className="navbar-links">
            <a href="#features">Features</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#install">Install</a>
            <a href="#contribute">Contribute</a>
            <a href="#support">Support</a>
            <a href="#usage">Usage</a>
            <a href="#troubleshooting">Troubleshooting</a>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
          </button>
        </div>
      </nav>

      <div className="layout">
        <header id="hero" className="hero">
          <p className="hero-prompt"><span className="prompt-user">❯</span> cat zsh-setup</p>
          <div className="hero-badge">v1.0 / MIT</div>
          <h1 className="hero-title">
            Your terminal,<br />
            <span className="hero-em">elevated.</span>
          </h1>
          <p className="hero-desc">
            A portable, cross-platform Oh My Zsh + Powerlevel10k configuration<br />
            with modern CLI tools, smart aliases, and performance tweaks.
          </p>
          <div className="hero-actions">
            <a href="#install" className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Get Started
            </a>
            <a href="https://github.com/alivinshiva/zsh-setup" className="btn btn-outline" target="_blank" rel="noopener noreferrer">
              View on GitHub →
            </a>
          </div>
        </header>

        <section id="features" className="section">
          <p className="section-prompt"><span className="prompt-user">❯</span> ls features/</p>
          <h2 className="section-title">Features</h2>
          <p className="section-sub">Everything you need for a modern terminal workflow.</p>
          <div className="grid">
            {features.map((f) => (
              <div key={f.title} className="card">
                <div className="card-dot" />
                <h3 className="card-title">{f.title}</h3>
                <p className="card-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="testimonials" className="section section-alt">
          <p className="section-prompt"><span className="prompt-user">❯</span> cat testimonials.log</p>
          <h2 className="section-title">Testimonials</h2>
          <p className="section-sub">Loved by developers who value a polished terminal.</p>
          <div className="testimonials">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <span className="testimonial-arrow">↳</span>
                  <div>
                    <strong>{t.author}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="install" className="section">
          <p className="section-prompt"><span className="prompt-user">❯</span> ./install.sh</p>
          <h2 className="section-title">Installation</h2>
          <p className="section-sub">One command, fully automated. Works on macOS &amp; Linux.</p>
          <div className="install-block">
            <div className="install-header">
              <span className="install-label">curl</span>
              <button className="copy-btn" onClick={copyCmd} title="Copy to clipboard">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
            <pre className="install-code"><code>$ bash -c "$(curl -fsSL https://raw.githubusercontent.com/alivinshiva/zsh-setup/master/install.sh)"</code></pre>
          </div>
          <div className="install-alt">
            <p>▸ Or clone &amp; run:</p>
            <pre className="install-code alt"><code>$ git clone https://github.com/alivinshiva/zsh-setup.git<br/>$ cd zsh-setup<br/>$ ./install.sh</code></pre>
          </div>
        </section>

        <section id="contribute" className="section section-alt">
          <p className="section-prompt"><span className="prompt-user">❯</span> git commit -m "feat: my contribution"</p>
          <h2 className="section-title">Contribute</h2>
          <p className="section-sub">Help make zsh-setup better for everyone.</p>
          <div className="contribute-grid">
            <a href="https://github.com/alivinshiva/zsh-setup/blob/master/CONTRIBUTING.md" className="contribute-card" target="_blank" rel="noopener noreferrer">
              <span className="contribute-icon">01</span>
              <h3>Read the Guide</h3>
              <p>Our contributing guide walks you through the process step by step.</p>
            </a>
            <a href="https://github.com/alivinshiva/zsh-setup/issues" className="contribute-card" target="_blank" rel="noopener noreferrer">
              <span className="contribute-icon">02</span>
              <h3>Find an Issue</h3>
              <p>Browse open issues and pick one that matches your skills.</p>
            </a>
            <a href="https://github.com/alivinshiva/zsh-setup/fork" className="contribute-card" target="_blank" rel="noopener noreferrer">
              <span className="contribute-icon">03</span>
              <h3>Fork &amp; PR</h3>
              <p>Fork the repo, make your changes, and open a pull request.</p>
            </a>
          </div>
        </section>

        <section id="support" className="section">
          <p className="section-prompt"><span className="prompt-user">❯</span> help --support</p>
          <h2 className="section-title">Support</h2>
          <p className="section-sub">Star, share, or reach out — every bit helps.</p>
          <div className="support-grid">
            <a href="https://github.com/alivinshiva/zsh-setup" className="support-card" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <h3>Star on GitHub</h3>
              <p>Show your support by starring the repository.</p>
            </a>
            <a href="https://github.com/alivinshiva/zsh-setup/issues" className="support-card" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <h3>Report an Issue</h3>
              <p>Found a bug? Let us know on GitHub Issues.</p>
            </a>
            <a href="https://github.com/alivinshiva/zsh-setup/discussions" className="support-card" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <h3>Start a Discussion</h3>
              <p>Ask questions, share setups, or suggest ideas.</p>
            </a>
            <a href="https://github.com/alivinshiva/zsh-setup" className="support-card" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              <h3>Spread the Word</h3>
              <p>Share zsh-setup with your team or on social media.</p>
            </a>
          </div>
        </section>

        <section id="usage" className="section">
          <p className="section-prompt"><span className="prompt-user">❯</span> man zsh-setup</p>
          <h2 className="section-title">Usage Guide</h2>
          <p className="section-sub">Everyday shortcuts and aliases to speed up your terminal workflow.</p>

          <div className="usage-category">
            <h3 className="usage-category-title">History Shortcuts</h3>
            <div className="usage-table">
              <div className="usage-row usage-head">
                <span className="usage-cell cmd">Shortcut</span>
                <span className="usage-cell desc">What it does</span>
                <span className="usage-cell example">Example</span>
              </div>
              {historyShortcuts.map((s, i) => (
                <div key={i} className="usage-row">
                  <span className="usage-cell cmd"><code>{s.cmd}</code></span>
                  <span className="usage-cell desc">{s.desc}</span>
                  <span className="usage-cell example">{s.example}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="usage-category">
            <h3 className="usage-category-title">Navigation Shortcuts</h3>
            <div className="usage-table">
              <div className="usage-row usage-head">
                <span className="usage-cell cmd">Shortcut</span>
                <span className="usage-cell desc">What it does</span>
                <span className="usage-cell example">Example</span>
              </div>
              {navShortcuts.map((s, i) => (
                <div key={i} className="usage-row">
                  <span className="usage-cell cmd"><code>{s.cmd}</code></span>
                  <span className="usage-cell desc">{s.desc}</span>
                  <span className="usage-cell example">{s.example}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="usage-category">
            <h3 className="usage-category-title">Custom Aliases</h3>
            <div className="usage-table">
              <div className="usage-row usage-head">
                <span className="usage-cell cmd">Alias</span>
                <span className="usage-cell desc">Expands to</span>
                <span className="usage-cell example">Description</span>
              </div>
              {customAliases.map((a, i) => (
                <div key={i} className="usage-row">
                  <span className="usage-cell cmd"><code>{a.alias}</code></span>
                  <span className="usage-cell desc"><code>{a.cmd}</code></span>
                  <span className="usage-cell example">{a.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="troubleshooting" className="section section-alt">
          <p className="section-prompt"><span className="prompt-user">❯</span> man troubleshooting</p>
          <h2 className="section-title">Troubleshooting</h2>
          <p className="section-sub">Quick fixes for common issues during or after installation.</p>
          <div className="fixes-grid">
            {fixes.map((f, i) => (
              <div key={i} className="fix-card">
                <div className="fix-header">
                  <span className="fix-number">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="fix-problem">{f.problem}</h3>
                </div>
                <p className="fix-solution">{f.solution}</p>
                <a href={f.link} className="fix-link" target="_blank" rel="noopener noreferrer">Full guide →</a>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-brand">zsh-setup</span>
          <span className="footer-divider">//</span>
          <a href="https://github.com/alivinshiva/zsh-setup" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span className="footer-divider">//</span>
          <a href="https://github.com/alivinshiva/zsh-setup/blob/master/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">Contributing</a>
          <span className="footer-divider">//</span>
          <a href="https://github.com/alivinshiva/zsh-setup/blob/master/TROUBLESHOOTING.md" target="_blank" rel="noopener noreferrer">Troubleshooting</a>
          <span className="footer-divider">//</span>
          <a href="#usage">Usage Guide</a>
          <span className="footer-divider">//</span>
          <span>MIT License</span>
        </div>
        <p className="footer-meta">crafted with &lt;3 for the terminal</p>
      </footer>
    </>
  )
}

export default App
