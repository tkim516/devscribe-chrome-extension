# devscribe-chrome-extension
# renamed to:
# PromptPilot Manager Chrome Extension

A Chrome extension for efficiently managing and organizing AI prompts. Create folders, save prompts, and quickly access them when working with AI tools.

## Release Notes - v0.1 (Alpha)

Initial release of the AI Prompt Manager extension with core functionality for organizing and accessing AI prompts.

### Features
- **Folder Organization**: Create and manage folders to organize your prompts by category or use case
- **Prompt Management**: 
  - Create, edit, and delete prompts
  - Pre-loaded example prompts in three categories
  - Copy prompts to clipboard with one click
- **Search Functionality**:
  - Quick search across all folders and prompts
- **Modern Interface**:
  - Clean, dark mode design
  - Intuitive folder and prompt navigation
  - Visual feedback for actions (copy, delete, etc.)
- **Local Storage**:
  - All prompts and folders are saved locally in your browser

### Pre-loaded Templates
- Writing Assistant
  - Professional Email Structure
- Code Helper
  - Code Review Guidelines
- Content Creation
  - Blog Post Framework

### Installation
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the extension directory containing the manifest.json file

### Usage
1. Click the extension icon in your Chrome toolbar
2. Browse pre-loaded prompts or create new folders
3. Add your own prompts using the "add" button in any folder
4. Use the search bar to find specific prompts
5. Click "copy" on any prompt to copy it to your clipboard

### Known Limitations
- Local storage only (no cloud sync)
- Limited to Chrome browser
- Two-level folder structure maximum

### Feedback
We welcome feedback and contributions! Please:
1. Report bugs by creating an issue
2. Suggest features through the issues section
3. Submit pull requests for improvements

### Technical Details
- Built with vanilla JavaScript
- Uses Chrome Storage API for data persistence
- Implements modern ES6+ features
- Dark mode by default

### Upcoming Features
- Cloud sync capabilities
- Import/export functionality
- Customizable themes
- Keyboard shortcuts
- Tag-based organization
