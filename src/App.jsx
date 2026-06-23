import { useState, useEffect, useRef } from 'react'
import './App.css'

const chars = ['$', '_', '>', '~', '#', '%', '&', '|', '/', '\\', '=', '@', '!', '?', '*']
const colors = ['#00d4ff', '#00ff88', '#ffd700', '#ff66cc', '#ff8844', '#aa66ff', '#ff4466', '#44aaff', '#66ff99', '#ffaa33', '#33ccff', '#ff5599', '#88ff66', '#dd88ff', '#ff9966']
const anims = ['float-up', 'float-down', 'float-drift-l', 'float-drift-r', 'float-diag']

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
const floating = chars.slice(0, isMobile ? 5 : 15).map((c, i) => ({
  char: c,
  color: colors[i],
  left: Math.random() * 80 + 5,
  top: Math.random() * 100,
  anim: anims[Math.floor(Math.random() * anims.length)],
  delay: Math.random() * 14,
  duration: Math.random() * 18 + 14,
  size: Math.random() * (isMobile ? 8 : 12) + (isMobile ? 10 : 12),
}))

const features = [
  { title: 'Powerlevel10k', desc: 'Classic prompt style with git status, execution time, virtualenv, and more.' },
  { title: 'Oh My Zsh', desc: '14 curated plugins — git, docker, npm, zoxide, extract, sudo, web-search, history-substring-search, you-should-use & more.' },
  { title: 'Smart Navigation', desc: 'zoxide replaces cd with fuzzy muscle memory. fzf with Ctrl+R / Ctrl+T / Alt+C.' },
  { title: 'Syntax Highlighting', desc: 'Real-time zsh-syntax-highlighting + zsh-autosuggestions as you type.' },
  { title: 'Modern Aliases', desc: 'ls → eza with icons, lt → tree view, ff → fzf + bat preview.' },
  { title: 'Cross-Platform', desc: 'Same experience on macOS and Linux. Auto-detects Homebrew vs apt paths.' },
  { title: 'git-delta', desc: 'Syntax-highlighted git diffs with side-by-side navigation.' },
  { title: 'Performance', desc: 'History dedup, transient prompt, instant prompt. fastfetch on start.' },
  { title: 'NVM', desc: 'Node Version Manager pre-integrated. Switch Node versions seamlessly.' },
  { title: 'fnm', desc: 'Fast Node Manager — a faster alternative to NVM, auto-detects .nvmrc.' },
  { title: 'History Search', desc: 'history-substring-search: type a prefix, press ↑/↓ to cycle through matching history.' },
  { title: 'Alias Reminders', desc: 'you-should-use plugin warns you when a command has an alias you forgot about.' },
  { title: 'lazygit', desc: 'Terminal UI for git. Blazing-fast branch switching, staging, and commit management.' },
  { title: 'lazydocker', desc: 'Docker management in the terminal — view containers, logs, images, and compose.' },
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

function StarCounter() {
  const [stars, setStars] = useState(null)
  useEffect(() => {
    fetch('https://api.github.com/repos/alivinshiva/zsh-setup')
      .then(r => r.json())
      .then(d => setStars(d.stargazers_count))
      .catch(() => setStars(null))
  }, [])
  return stars !== null ? (
    <a href="https://github.com/alivinshiva/zsh-setup/stargazers" className="star-badge" target="_blank" rel="noopener noreferrer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}
    </a>
  ) : null
}

const installLog = [
  { text: 'Cloning repository...', type: 'cmd' },
  { text: '→ https://github.com/alivinshiva/zsh-setup.git', type: 'info' },
  { text: '✓ Repository cloned', type: 'ok' },
  { text: 'Installing Oh My Zsh...', type: 'cmd' },
  { text: '→ ohmyzsh/ohmyzsh', type: 'info' },
  { text: '✓ Oh My Zsh installed', type: 'ok' },
  { text: 'Installing Powerlevel10k...', type: 'cmd' },
  { text: '→ romkatv/powerlevel10k', type: 'info' },
  { text: '✓ Powerlevel10k theme installed', type: 'ok' },
  { text: 'Installing CLI tools...', type: 'cmd' },
  { text: '→ eza bat fd fzf fastfetch zoxide', type: 'info' },
  { text: '✓ Tools installed', type: 'ok' },
  { text: 'Linking dotfiles...', type: 'cmd' },
  { text: '→ .zshrc → ~/.zshrc', type: 'info' },
  { text: '→ .p10k.zsh → ~/.p10k.zsh', type: 'info' },
  { text: '✓ Dotfiles linked', type: 'ok' },
  { text: 'Configuring git-delta...', type: 'cmd' },
  { text: '✓ git-delta configured as default pager', type: 'ok' },
  { text: '✅ Done! Restart your terminal or run: source ~/.zshrc', type: 'done' },
]

function TerminalDemo() {
  const [visible, setVisible] = useState(0)
  const [restarting, setRestarting] = useState(false)
  const [pos, setPos] = useState(() => {
    if (typeof window !== 'undefined') {
      return { x: window.innerWidth - 480, y: window.innerHeight - 380 }
    }
    return { x: 200, y: 200 }
  })
  const drag = useRef(false)
  const offset = useRef({ x: 0, y: 0 })
  const el = useRef(null)

  useEffect(() => {
    if (visible < installLog.length) {
      const delay = installLog[visible].type === 'info' ? 200 : 400
      const t = setTimeout(() => setVisible(v => v + 1), delay)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setRestarting(true)
        setTimeout(() => { setVisible(0); setRestarting(false) }, 300)
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [visible])

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!drag.current) return
      setPos({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      })
    }
    const onTouchMove = (e) => {
      if (!drag.current) return
      const t = e.touches[0]
      setPos({
        x: t.clientX - offset.current.x,
        y: t.clientY - offset.current.y,
      })
    }
    const onEnd = () => { drag.current = false }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [])

  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [visible])

  const onDragStart = (e) => {
    drag.current = true
    const rect = el.current.getBoundingClientRect()
    const clientX = e.clientX ?? e.touches[0].clientX
    const clientY = e.clientY ?? e.touches[0].clientY
    offset.current = { x: clientX - rect.left, y: clientY - rect.top }
  }

  return (
    <div className="terminal-demo" ref={el} style={{ left: pos.x, top: pos.y }}>
      <div className="terminal-demo-bar" onMouseDown={onDragStart} onTouchStart={onDragStart}>
        <span className="terminal-demo-dot" style={{ background: '#ff5f57' }} />
        <span className="terminal-demo-dot" style={{ background: '#ffbd2e' }} />
        <span className="terminal-demo-dot" style={{ background: '#28c840' }} />
        <span className="terminal-demo-title">install.sh</span>
      </div>
      <div className={`terminal-demo-body ${restarting ? 'fade-out' : ''}`} ref={scrollRef}>
        {installLog.slice(0, visible).map((line, i) => (
          <div key={i} className={`terminal-demo-line line-${line.type}`}>
            <span className="terminal-demo-prefix">
              {line.type === 'cmd' && <span className="prompt-sign">$</span>}
              {line.type === 'info' && <span className="info-sign">▸</span>}
              {line.type === 'ok' && <span className="ok-sign">✓</span>}
              {line.type === 'done' && <span className="done-sign">◆</span>}
            </span>
            <span>{line.text}</span>
          </div>
        ))}
        {visible <= installLog.length && (
          <span className="terminal-cursor" />
        )}
      </div>
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('zsh-theme') || 'dark'
    }
    return 'dark'
  })
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('zsh-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  const copyCmd = () => {
    navigator.clipboard.writeText('bash -c "$(curl -fsSL https://raw.githubusercontent.com/alivinshiva/zsh-setup/master/install.sh)"')
  }

  const closeMenu = () => setMenuOpen(false)

  const navItems = [
    { href: '#features', label: 'Features' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#screenshots', label: 'Screenshots' },
    { href: '#install', label: 'Install' },
    { href: '#usage', label: 'Usage' },
    { href: '#troubleshooting', label: 'Troubleshooting' },
    { href: '#faq', label: 'FAQ' },
    { href: '#contribute', label: 'Contribute' },
  ]

  return (
    <>
      <div className="terminal-bg" aria-hidden="true">
        {floating.map((f, i) => (
          <span key={i} style={{ left: `${f.left}%`, top: `${f.top}%`, animationName: f.anim, animationDelay: `${f.delay}s`, animationDuration: `${f.duration}s`, color: f.color, fontSize: `${f.size}px` }}>{f.char}</span>
        ))}
      </div>

      <nav className="navbar">
        <div className="navbar-inner">
          <a href="#hero" className="navbar-brand" onClick={closeMenu}>zsh-setup</a>
          <div className="navbar-links">
            {navItems.map(({ href, label }) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </div>
          <div className="navbar-right">
            <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              <span /><span /><span />
            </button>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              )}
            </button>
          </div>
        </div>
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          {navItems.map(({ href, label }) => (
            <a key={href} href={href} onClick={closeMenu}>{label}</a>
          ))}
        </div>
      </nav>

      <div className="layout">
        <header id="hero" className="hero">
          <p className="hero-prompt"><span className="prompt-user">❯</span> cat zsh-setup</p>
          <div className="hero-badges">
            <span className="hero-badge">v1.2 / MIT</span>
            <StarCounter />
          </div>
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
            <a href="https://twitter.com/intent/tweet?text=Just%20set%20up%20my%20terminal%20in%20one%20command%20with%20zsh-setup%20%F0%9F%9A%80%0A%0Abash%20%3C%24(curl%20-fsSL%20https%3A%2F%2Fraw.githubusercontent.com%2Falivinshiva%2Fzsh-setup%2Fmaster%2Finstall.sh)%0A%0Ahttps%3A%2F%2Fgithub.com%2Falivinshiva%2Fzsh-setup" className="btn btn-outline" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Share on X
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

        <section id="screenshots" className="section section-alt">
          <p className="section-prompt"><span className="prompt-user">❯</span> ls screenshots/</p>
          <h2 className="section-title">Screenshots</h2>
          <p className="section-sub">See zsh-setup in action across different workflows.</p>
          <div className="screenshots">
            <div className="screenshot-card">
              <div className="screenshot-preview">
                <div className="screenshot-bar"><span /><span /><span /><span className="screenshot-title">~ — terminal</span></div>
                <div className="screenshot-body">
                  <div className="ss-line"><span className="ss-prompt">❯</span><span className="ss-cmd">cd project</span></div>
                  <div className="ss-line"><span className="ss-prompt">~/project</span><span className="ss-cmd">ls</span></div>
                  <div className="ss-line"><span className="ss-dir">src/</span><span className="ss-file">package.json</span><span className="ss-file">README.md</span></div>
                  <div className="ss-line"><span className="ss-prompt">~/project</span><span className="ss-cmd">git status</span></div>
                  <div className="ss-line"><span className="ss-branch"> main</span><span className="ss-delta">▸ modified: src/App.jsx</span></div>
                  <div className="ss-line"><span className="ss-time">2.3s</span><span className="ss-prompt-end">❯</span></div>
                </div>
              </div>
              <p className="screenshot-label">Git status with delta diff</p>
            </div>
            <div className="screenshot-card">
              <div className="screenshot-preview">
                <div className="screenshot-bar"><span /><span /><span /><span className="screenshot-title">fzf — find files</span></div>
                <div className="screenshot-body">
                  <div className="ss-line"><span className="ss-prompt">❯</span><span className="ss-cmd">ff</span></div>
                  <div className="ss-line"><span className="ss-fzf-border">━━━━━━━━━━━━━━━━━━━━━━━━━━</span></div>
                  <div className="ss-line"><span className="ss-fzf-select">▸ src/App.jsx</span></div>
                  <div className="ss-line"><span className="ss-fzf-item">  src/App.css</span></div>
                  <div className="ss-line"><span className="ss-fzf-item">  src/index.css</span></div>
                  <div className="ss-line"><span className="ss-fzf-item">  index.html</span></div>
                  <div className="ss-line"><span className="ss-fzf-border">━━━━━━━━━━━━━━━━━━━━━━━━━━</span></div>
                  <div className="ss-line"><span className="ss-fzf-preview">import { useState } from 'react'</span></div>
                </div>
              </div>
              <p className="screenshot-label">fzf fuzzy finder with bat preview</p>
            </div>
            <div className="screenshot-card">
              <div className="screenshot-preview">
                <div className="screenshot-bar"><span /><span /><span /><span className="screenshot-title">lazygit — commit</span></div>
                <div className="screenshot-body">
                  <div className="ss-line"><span className="ss-prompt">❯</span><span className="ss-cmd">lg</span></div>
                  <div className="ss-line"><span className="ss-lg-header">Status (1 modified)</span></div>
                  <div className="ss-line"><span className="ss-lg-file">M src/App.jsx</span></div>
                  <div className="ss-line"><span className="ss-lg-header"> ── diff ──</span></div>
                  <div className="ss-line"><span className="ss-lg-add">+  {'{'} title: 'lazygit',</span></div>
                  <div className="ss-line"><span className="ss-lg-add">+    desc: 'Terminal UI for git' {'}'}</span></div>
                  <div className="ss-line"><span className="ss-lg-keys">↑↓ navigate  space stage  c commit</span></div>
                </div>
              </div>
              <p className="screenshot-label">lazygit TUI — stage & commit</p>
            </div>
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

        <section id="usage" className="section section-alt">
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

        <section id="troubleshooting" className="section">
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

        <section id="faq" className="section section-alt">
          <p className="section-prompt"><span className="prompt-user">❯</span> help -f</p>
          <h2 className="section-title">FAQ</h2>
          <p className="section-sub">Common questions about zsh-setup.</p>
          <div className="faq-list">
            <details className="faq-item">
              <summary className="faq-question">Does this work with an existing .zshrc?</summary>
              <div className="faq-answer">
                Yes. The install script backs up your existing <code>.zshrc</code> and <code>.p10k.zsh</code> to <code>.zshrc.backup</code> / <code>.p10k.zsh.backup</code> before creating symlinks. Your old configs are never deleted.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">What if I already have Oh My Zsh installed?</summary>
              <div className="faq-answer">
                No problem. The script detects an existing Oh My Zsh installation and skips re-installing it. It only adds Powerlevel10k and the custom plugins.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Can I use this on Windows?</summary>
              <div className="faq-answer">
                zsh-setup targets macOS and Linux natively. On Windows, use <strong>WSL2</strong> (Windows Subsystem for Linux) with Ubuntu — it works identically to the Linux setup.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">What is the difference between NVM and fnm?</summary>
              <div className="faq-answer">
                <strong>fnm</strong> (Fast Node Manager) is a Rust-based alternative to NVM that is significantly faster. It supports <code>.nvmrc</code> auto-switching. Both are installed; <code>fnm</code> takes precedence if available.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">How do I update zsh-setup after installing?</summary>
              <div className="faq-answer">
                Re-run the install command — it pulls the latest version, backs up old configs, and re-links everything. Your customizations (like <code>.p10k.zsh</code> prompt config) are preserved in backup files.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Why can't I see fancy icons / glyphs?</summary>
              <div className="faq-answer">
                You need a <strong>Nerd Font</strong> installed and selected in your terminal emulator. We recommend <strong>JetBrains Mono Nerd Font</strong>. Powerlevel10k will prompt you to install one on first run.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Is there a way to only install the essential tools?</summary>
              <div className="faq-answer">
                Yes! Run the installer with the <code>--minimal</code> flag to skip optional tools (fastfetch, lazygit, lazydocker, git-delta, tldr):<br />
                <code>bash -c "$(curl -fsSL https://raw.githubusercontent.com/alivinshiva/zsh-setup/master/install.sh)" --minimal</code>
              </div>
            </details>
          </div>
        </section>

        <section id="changelog" className="section">
          <p className="section-prompt"><span className="prompt-user">❯</span> tail CHANGELOG.md</p>
          <h2 className="section-title">Changelog</h2>
          <p className="section-sub">Recent updates and improvements.</p>
          <div className="changelog">
            <div className="changelog-entry">
              <span className="changelog-version">v1.2.0</span>
              <span className="changelog-date">2026-06-22</span>
              <ul className="changelog-items">
                <li>Added <code>history-substring-search</code> plugin — ↑/↓ to search history by typed prefix</li>
                <li>Added <code>you-should-use</code> plugin — warns on missed aliases</li>
                <li>Added <code>fnm</code> (Fast Node Manager) support</li>
                <li>Added <code>mkcd</code>, <code>lg</code>, <code>ld</code> aliases</li>
                <li>Added <code>--minimal</code> flag for lighter installations</li>
                <li>Added <code>uninstall.sh</code> script</li>
                <li>Showcase website: star counter, share button, screenshots, FAQ, comparison</li>
              </ul>
            </div>
            <div className="changelog-entry">
              <span className="changelog-version">v1.1.0</span>
              <span className="changelog-date">2026-06-20</span>
              <ul className="changelog-items">
                <li>Showcase website with TUI aesthetic</li>
                <li>Added CONTRIBUTING.md and TROUBLESHOOTING.md</li>
                <li>git-delta configuration</li>
              </ul>
            </div>
            <div className="changelog-entry">
              <span className="changelog-version">v1.0.0</span>
              <span className="changelog-date">2026-06-18</span>
              <ul className="changelog-items">
                <li>Initial release — Oh My Zsh + Powerlevel10k + core tools</li>
              </ul>
            </div>
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
          <a href="#faq">FAQ</a>
          <span className="footer-divider">//</span>
          <a href="#changelog">Changelog</a>
          <span className="footer-divider">//</span>
          <span>MIT License</span>
        </div>
        <p className="footer-meta">crafted with &lt;3 for the terminal</p>
      </footer>
      <TerminalDemo />
    </>
  )
}

export default App
