# Contributing Guide

Bedankt voor je interesse in het bijdragen aan het 24-urenloop Board project! 

## 🚀 Development Setup

### 1. Fork en Clone

```bash
git clone https://github.com/jouw-username/24-urenloop-board.git
cd 24-urenloop-board
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or manually:
cd server && npm install
cd ../client && npm install
```

### 3. Setup Environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit .env files as needed
```

### 4. Start Development

**Optie A: Met Docker (aanbevolen)**
```bash
docker-compose up -d  # Start Redis + Server
cd client && npm run dev  # Start client
```

**Optie B: Manual**
```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Server
cd server && npm run dev

# Terminal 3: Client
cd client && npm run dev
```

### 5. Verify Setup

- Open browser: `http://localhost:5173`
- Check connection status: Should show "● Verbonden"
- Try adding a runner

## 📝 Code Style

### JavaScript/React

- Gebruik ES6+ syntax
- Prefer `const` over `let`, avoid `var`
- Use arrow functions waar mogelijk
- 2 spaces voor indentation
- Semicolons zijn optioneel maar wees consistent
- Comments in Nederlands of Engels (consistent binnen een file)

### Naming Conventions

```javascript
// Components: PascalCase
function RunnerCard() { }

// Functions: camelCase
function addRunner() { }

// Constants: SCREAMING_SNAKE_CASE
const REDIS_KEY = 'runners:state';

// Private functions: _prefix (optioneel)
function _validateRunner() { }
```

### File Structure

```javascript
// 1. Imports
import React from 'react';
import { useState } from 'react';
import './Component.css';

// 2. Constants
const DEFAULT_STATE = {};

// 3. Helper functions
function formatTime(ms) { }

// 4. Main component
function Component() {
  // Hooks
  const [state, setState] = useState();
  
  // Handlers
  const handleClick = () => { };
  
  // Effects
  useEffect(() => { }, []);
  
  // Render
  return <div></div>;
}

// 5. Export
export default Component;
```

## 🧪 Testing

### Run Tests

```bash
cd server
npm test
```

### Write Tests

Voor nieuwe features, voeg tests toe in `server/tests/`:

```javascript
describe('New Feature', () => {
  it('should do something', async () => {
    // Arrange
    const input = ...;
    
    // Act
    const result = await myFunction(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### Manual Testing

Volg de scenarios in `TESTING.md` voor E2E testing.

## 🔀 Git Workflow

### Branch Naming

```
feature/add-authentication
bugfix/timer-sync-issue
hotfix/security-vulnerability
docs/update-readme
refactor/simplify-socket-handler
```

### Commit Messages

Gebruik conventional commits format:

```
feat: add user authentication
fix: resolve timer synchronization bug
docs: update deployment guide
refactor: simplify socket event handlers
test: add tests for runner service
chore: update dependencies
```

**Examples:**

```bash
git commit -m "feat: add admin PIN protection for delete operations"
git commit -m "fix: prevent race condition in moveRunner"
git commit -m "docs: add troubleshooting section to README"
```

### Pull Request Process

1. **Create Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update docs

3. **Test Locally**
   ```bash
   npm test
   # Manual E2E testing
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

5. **Push**
   ```bash
   git push origin feature/my-feature
   ```

6. **Open Pull Request**
   - Clear description
   - Link related issues
   - Add screenshots/videos if UI changes

7. **Code Review**
   - Address feedback
   - Update PR

8. **Merge**
   - Squash and merge
   - Delete branch

## 🐛 Bug Reports

### What to Include

```markdown
**Describe the bug**
Clear description of what went wrong.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What should have happened.

**Screenshots**
If applicable.

**Environment:**
 - OS: [e.g. Ubuntu 22.04]
 - Browser: [e.g. Chrome 120]
 - Docker version: [e.g. 24.0.7]
 - Deployment: [Docker / Manual / Systemd]

**Logs**
```
Paste relevant logs here
```

**Additional context**
Any other information.
```

## ✨ Feature Requests

### Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you thought about.

**Additional context**
Any other context, mockups, examples.
```

## 📚 Documentation

### When to Update Docs

- Adding new features → Update README.md
- Changing deployment → Update DEPLOYMENT.md
- Adding environment variables → Update .env.example
- Changing architecture → Update ARCHITECTURE.md
- New testing procedures → Update TESTING.md

### Documentation Style

- Clear and concise
- Use examples
- Include code snippets
- Add screenshots for UI changes
- Keep it up-to-date

## 🔐 Security

### Reporting Vulnerabilities

**DO NOT** open a public issue for security vulnerabilities.

Instead:
1. Email [email@example.com] with details
2. Include steps to reproduce
3. Wait for response before disclosure

### Security Best Practices

- Never commit secrets/credentials
- Use environment variables
- Validate all user input
- Sanitize data before storing
- Follow principle of least privilege

## 📋 Code Review Checklist

### For Authors

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log() left in production code
- [ ] No commented out code
- [ ] Meaningful variable names
- [ ] Error handling implemented
- [ ] Tested locally

### For Reviewers

- [ ] Logic is sound
- [ ] Edge cases considered
- [ ] Performance implications checked
- [ ] Security implications checked
- [ ] Tests are comprehensive
- [ ] Documentation is clear
- [ ] Code is maintainable

## 🎯 Project Priorities

1. **Reliability** - System must work consistently
2. **Performance** - <200ms latency for updates
3. **Maintainability** - Code should be easy to understand
4. **Security** - Protect user data
5. **User Experience** - Intuitive and responsive UI

## 🤝 Communication

### Where to Ask Questions

- **GitHub Issues:** Feature requests, bug reports
- **GitHub Discussions:** General questions, ideas
- **Pull Request Comments:** Code-specific questions

### Response Times

- Issues: Within 2-3 days
- Pull Requests: Within 1 week
- Security issues: Within 24 hours

## 📊 Project Structure

Understanding the codebase:

```
server/          → Backend (Node.js + Express + Socket.IO)
  src/
    index.js     → Entry point, server setup
    redis.js     → Redis client & configuration
    socketHandler.js → Socket.IO event handlers
    runnerService.js → Business logic, state management

client/          → Frontend (React + Vite)
  src/
    App.jsx      → Main app component
    hooks/       → Custom React hooks
    components/  → UI components

tests/           → Test files
docs/            → Additional documentation
docker-compose.yml → Container orchestration
```

## 🎓 Learning Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [React Hooks](https://react.dev/reference/react)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## 🙏 Thank You!

Every contribution, no matter how small, is valuable. Whether it's:
- Reporting a bug
- Fixing a typo
- Adding a feature
- Improving documentation
- Helping other users

Your contribution makes this project better. Thank you! 🎉