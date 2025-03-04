const DEFAULT_STATE = {
  folders: [
    {
      id: '1',
      name: '\u270D\uFE0F Writing Assistant',
      prompts: [
        {
          id: '1-1',
          title: 'Professional Email',
          content: `Write a professional email that is concise, clear, and maintains a friendly yet formal tone. Consider the following structure:
1. Brief greeting
2. Clear purpose in the first sentence
3. Necessary details in 1-2 paragraphs
4. Specific call to action
5. Professional closing

Make sure to:
- Be concise and respect the recipient's time
- Maintain a professional tone
- Include all necessary information
- End with a clear next step`
        }
      ]
    },
    {
      id: '2',
      name: '\u{1F4BB} Code Helper',
      prompts: [
        {
          id: '2-1',
          title: 'Code Review',
          content: `Please review this code for:
1. Potential bugs and errors
2. Performance improvements
3. Best practices
4. Code style and consistency
5. Security concerns

Provide specific examples and explanations for any issues found.`
        }
      ]
    },
    {
      id: '3',
      name: '\u{1F4DD} Content Creation',
      prompts: [
        {
          id: '3-1',
          title: 'Blog Post Structure',
          content: `Create a well-structured blog post following this framework:
1. Attention-grabbing introduction
2. Clear value proposition
3. Main points (3-5 sections)
4. Supporting evidence and examples
5. Actionable takeaways

Ensure to:
- Use engaging subheadings
- Include relevant examples
- Maintain consistent tone
- End with a clear conclusion
- Add a call to action`
        }
      ]
    }
  ]
};

let state = {
  folders: []
};

// Modified to include setupImportExportListeners
document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM fully loaded");
  await loadState();
  console.log("State loaded")
  setupEventListeners();
  setupImportExportListeners(); // Call the import/export setup function
  setupLLMFeatures(); // New
  console.log("Event listeners set up");
});

async function loadState() {
  const result = await chrome.storage.local.get(['promptManager']);
  if (result.promptManager) {
    state = result.promptManager;
  } else {
    // Load default state if no saved state exists
    state = DEFAULT_STATE;
    await saveState();
  }
  renderLibrary();
}

async function saveState() {
  await chrome.storage.local.set({ promptManager: state });
}

function setupEventListeners() {
  document.getElementById('createFolder').addEventListener('click', () => {
    showFolderModal();
  });
  document.getElementById('searchPrompts').addEventListener('input', handleSearch);
  document.getElementById('saveFolder').addEventListener('click', handleFolderSave);
  document.getElementById('savePrompt').addEventListener('click', handlePromptSave);
  document.getElementById('cancelFolder').addEventListener('click', () => {
    document.getElementById('folderModal').style.display = 'none';
  });
  document.getElementById('cancelPrompt').addEventListener('click', () => {
    document.getElementById('promptModal').style.display = 'none';
  });
}

// Update the showFolderModal function
function showFolderModal(isEdit = false, folder = null) {
  const modal = document.getElementById('folderModal');
  const titleEl = document.getElementById('folderModalTitle');
  const nameInput = document.getElementById('folderName');
  const saveButton = document.getElementById('saveFolder');
  
  titleEl.textContent = isEdit ? 'Edit Folder' : 'Create New Folder';
  
  // For edit mode, store original name and disable save button initially
  if (isEdit && folder) {
    nameInput.value = folder.name;
    nameInput.dataset.originalName = folder.name; // Store original value
    saveButton.disabled = true; // Disable save button initially
    
    // Add input event listener to check for changes
    nameInput.addEventListener('input', checkFolderChanges);
  } else {
    // For new folder, enable save button and clear any previous data
    nameInput.value = '';
    delete nameInput.dataset.originalName;
    saveButton.disabled = false;
    
    // Remove previous listener if exists
    nameInput.removeEventListener('input', checkFolderChanges);
  }
  
  modal.style.display = 'block';
  nameInput.focus();
}

// Add this function to check for folder changes
function checkFolderChanges() {
  const nameInput = document.getElementById('folderName');
  const saveButton = document.getElementById('saveFolder');
  
  // Enable save button only if current value differs from original
  if (nameInput.dataset.originalName !== undefined) {
    saveButton.disabled = nameInput.value.trim() === nameInput.dataset.originalName;
  }
}

async function handleFolderSave() {
  const nameInput = document.getElementById('folderName');
  const name = nameInput.value.trim();
  
  if (!name) return;
  
  if (nameInput.dataset.originalName !== undefined) {
    // Update existing folder
    const folder = state.folders.find(f => f.name === nameInput.dataset.originalName);
    if (folder) {
      folder.name = name;
    }
  } else {
    // Create new folder
    const newFolder = {
      id: Date.now().toString(),
      name,
      prompts: []
    };
    state.folders.push(newFolder);
  }
  
  await saveState();
  renderLibrary();
  
  document.getElementById('folderModal').style.display = 'none';
  nameInput.value = '';
  delete nameInput.dataset.originalName;
}

// Update the showPromptModal function
function showPromptModal(folderId, isEdit = false, prompt = null) {
  const modal = document.getElementById('promptModal');
  const titleEl = document.getElementById('modalTitle');
  const promptTitleInput = document.getElementById('promptTitle');
  const promptContentInput = document.getElementById('promptContent');
  const saveButton = document.getElementById('savePrompt');
  
  titleEl.textContent = isEdit ? 'Edit Prompt' : 'Create New Prompt';
  
  // For edit mode, store original values and disable save button initially
  if (isEdit && prompt) {
    promptTitleInput.value = prompt.title;
    promptContentInput.value = prompt.content;
    
    // Store original values
    promptTitleInput.dataset.originalTitle = prompt.title;
    promptContentInput.dataset.originalContent = prompt.content;
    
    // Disable save button initially
    saveButton.disabled = true;
    
    // Add input event listeners to check for changes
    promptTitleInput.addEventListener('input', checkPromptChanges);
    promptContentInput.addEventListener('input', checkPromptChanges);
  } else {
    // For new prompt, clear any previous data and enable save button
    promptTitleInput.value = '';
    promptContentInput.value = '';
    
    delete promptTitleInput.dataset.originalTitle;
    delete promptContentInput.dataset.originalContent;
    
    saveButton.disabled = false;
    
    // Remove previous listeners if they exist
    promptTitleInput.removeEventListener('input', checkPromptChanges);
    promptContentInput.removeEventListener('input', checkPromptChanges);
  }
  
  state.currentFolder = folderId;
  state.editingPromptId = isEdit ? prompt.id : null; // Track if we're editing existing prompt
  
  modal.style.display = 'block';
  promptTitleInput.focus();
}

// Add this function to check for prompt changes
function checkPromptChanges() {
  const titleInput = document.getElementById('promptTitle');
  const contentInput = document.getElementById('promptContent');
  const saveButton = document.getElementById('savePrompt');
  
  // Check if we have original values stored (edit mode)
  if (titleInput.dataset.originalTitle !== undefined && contentInput.dataset.originalContent !== undefined) {
    // Enable save button only if either field has changed
    const titleChanged = titleInput.value.trim() !== titleInput.dataset.originalTitle;
    const contentChanged = contentInput.value.trim() !== contentInput.dataset.originalContent;
    
    saveButton.disabled = !(titleChanged || contentChanged);
  }
}

async function handlePromptSave() {
  const titleInput = document.getElementById('promptTitle');
  const contentInput = document.getElementById('promptContent');
  
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  
  if (!title || !content) return;
  
  const folder = state.folders.find(f => f.id === state.currentFolder);
  if (!folder) return;
  
  if (state.editingPromptId) {
    // Update existing prompt
    const promptIndex = folder.prompts.findIndex(p => p.id === state.editingPromptId);
    if (promptIndex !== -1) {
      folder.prompts[promptIndex].title = title;
      folder.prompts[promptIndex].content = content;
    }
  } else {
    // Create new prompt
    const newPrompt = {
      id: Date.now().toString(),
      title,
      content
    };
    folder.prompts.push(newPrompt);
  }
  
  await saveState();
  renderLibrary();
  
  document.getElementById('promptModal').style.display = 'none';
  titleInput.value = '';
  contentInput.value = '';
}

async function handleDelete(folderId, promptId = null) {
  if (promptId) {
    const folder = state.folders.find(f => f.id === folderId);
    if (folder) {
      folder.prompts = folder.prompts.filter(p => p.id !== promptId);
    }
  } else {
    state.folders = state.folders.filter(f => f.id !== folderId);
  }
  
  await saveState();
  renderLibrary();
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const folders = document.querySelectorAll('.folder');
  
  folders.forEach(folder => {
    const folderName = folder.querySelector('.folder-name').textContent.toLowerCase();
    const prompts = folder.querySelectorAll('.prompt-item');
    let hasMatch = folderName.includes(searchTerm);
    
    prompts.forEach(prompt => {
      const promptText = prompt.querySelector('.prompt-title').textContent.toLowerCase();
      const match = promptText.includes(searchTerm);
      prompt.style.display = match ? 'flex' : 'none';
      hasMatch = hasMatch || match;
    });
    
    folder.style.display = hasMatch ? 'block' : 'none';
  });
}

async function copyPrompt(promptContent) {
  try {
    await navigator.clipboard.writeText(promptContent);
    // Could add a success notification here
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = 'Copied to clipboard!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

// Modified renderLibrary to include null check
function renderLibrary() {
  const container = document.getElementById('promptLibrary');
  
  // Add this check to prevent errors if the element doesn't exist
  if (!container) {
    console.error('Element with ID "promptLibrary" not found');
    return;
  }
  
  container.innerHTML = '';
  
  state.folders.forEach(folder => {
    const folderEl = document.createElement('div');
    folderEl.className = 'folder';
    
    folderEl.innerHTML = `
      <div class="folder-header">
        <span class="folder-name">${folder.name}</span>
        <div class="actions">
          <button class="btn add-prompt">add</button>
          <button class="btn mod-folder">mod</button>
          <button class="btn del-folder">del</button>
        </div>
      </div>
      <div class="folder-content">
      ${folder.prompts.map(prompt => `
        <div class="prompt-item">
          <span class="prompt-title">${prompt.title}</span>
          <div class="actions">
            <button class="btn copy-prompt" data-content="${prompt.content.replace(/"/g, '&quot;')}">copy</button>
            <div class="dropdown">
              <button class="btn action-btn">actions</button>
              <div class="dropdown-content">
                <a href="#" class="send-to-default" data-prompt-id="${prompt.id}">Send to Default LLM</a>
                <div class="dropdown-submenu">
                  <a href="#" class="dropdown-submenu-title">Send to...</a>
                  <div class="dropdown-submenu-content">
                    <a href="#" class="send-to-llm" data-llm="chatgpt" data-prompt-id="${prompt.id}">ChatGPT</a>
                    <a href="#" class="send-to-llm" data-llm="claude" data-prompt-id="${prompt.id}">Claude</a>
                    <a href="#" class="send-to-llm" data-llm="perplexity" data-prompt-id="${prompt.id}">Perplexity</a>
                    <a href="#" class="send-to-llm" data-llm="grok" data-prompt-id="${prompt.id}">Grok</a>
                  </div>
                </div>
                <a href="#" class="set-default-llm" data-prompt-id="${prompt.id}">Set Default LLM</a>
              </div>
            </div>
            <button class="btn mod-prompt">mod</button>
            <button class="btn del-prompt">del</button>
          </div>
        </div>
      `).join('')}
      </div>
    `;
    
    // Add event listeners
    const header = folderEl.querySelector('.folder-header');
    const content = folderEl.querySelector('.folder-content');
    
    header.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn')) {
        content.classList.toggle('open');
      }
    });
    
    folderEl.querySelector('.add-prompt').addEventListener('click', () => {
      showPromptModal(folder.id);
    });
    
    folderEl.querySelector('.mod-folder').addEventListener('click', () => {
      showFolderModal(true, folder);
    });
    
    folderEl.querySelector('.del-folder').addEventListener('click', () => {
      handleDelete(folder.id);
    });
    
    const copyButtons = folderEl.querySelectorAll('.copy-prompt');
    copyButtons.forEach(button => {
      button.addEventListener('click', () => {
        copyPrompt(button.dataset.content);
      });
    });
    
    const modPromptButtons = folderEl.querySelectorAll('.mod-prompt');
    modPromptButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        showPromptModal(folder.id, true, folder.prompts[index]);
      });
    });
    
    const delPromptButtons = folderEl.querySelectorAll('.del-prompt');
    delPromptButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        handleDelete(folder.id, folder.prompts[index].id);
      });
    });
    
    container.appendChild(folderEl);
  });
}

// Set up event listeners for import/export
function setupImportExportListeners() {
  // Added debug logs and null checks
  console.log("Setting up import/export listeners");
  
  const exportBtn = document.getElementById('exportPrompts');
  const importBtn = document.getElementById('importPrompts');
  
  console.log("Export button:", exportBtn);
  console.log("Import button:", importBtn);
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportPromptLibrary);
  } else {
    console.error("Export button not found");
  }
  
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const importModal = document.getElementById('importModal');
      if (importModal) {
        importModal.style.display = 'block';
        const importFile = document.getElementById('importFile');
        const previewContent = document.getElementById('previewContent');
        const confirmImport = document.getElementById('confirmImport');
        
        if (importFile) importFile.value = '';
        if (previewContent) previewContent.innerHTML = 'Select a file to see import preview';
        if (confirmImport) confirmImport.disabled = true;
      } else {
        console.error("Import modal not found. Make sure to add it to your HTML.");
      }
    });
  } else {
    console.error("Import button not found");
  }
  
  const importFile = document.getElementById('importFile');
  if (importFile) {
    importFile.addEventListener('change', handleFileSelect);
  }
  
  const confirmImportBtn = document.getElementById('confirmImport');
  if (confirmImportBtn) {
    confirmImportBtn.addEventListener('click', confirmImport);
  }
  
  const cancelImportBtn = document.getElementById('cancelImport');
  if (cancelImportBtn) {
    cancelImportBtn.addEventListener('click', () => {
      const importModal = document.getElementById('importModal');
      if (importModal) {
        importModal.style.display = 'none';
      }
    });
  }
}

// Export the entire prompt library as a JSON file
function exportPromptLibrary() {
  console.log("Exporting prompt library");
  const dataStr = JSON.stringify(state, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'promptpilot-export.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  // Show success notification
  showNotification('Library exported successfully!');
}

// Preview the file to be imported
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const confirmButton = document.getElementById('confirmImport');
  const previewContent = document.getElementById('previewContent');
  
  // Check if elements exist
  if (!confirmButton || !previewContent) {
    console.error("Required import modal elements not found");
    return;
  }
  
  // Clear preview
  previewContent.innerHTML = '<div class="loading">Analyzing file...</div>';
  confirmButton.disabled = true;
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    let importData;
    let previewHTML = '';
    
    try {
      if (file.name.endsWith('.json')) {
        importData = JSON.parse(e.target.result);
        
        // Validate JSON structure
        if (!importData.folders || !Array.isArray(importData.folders)) {
          throw new Error('Invalid JSON format: missing folders array');
        }
        
        // Generate preview
        previewHTML = `<div class="preview-stats">
          <p>Found ${importData.folders.length} folders with ${countTotalPrompts(importData.folders)} prompts</p>
        </div>
        <div class="preview-folders">
          ${importData.folders.map(folder => `
            <div class="preview-folder">
              <strong>${folder.name}</strong> (${folder.prompts.length} prompts)
            </div>
          `).join('')}
        </div>`;
        
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV
        const csvData = parseCSV(e.target.result);
        importData = convertCSVToState(csvData);
        
        // Generate preview
        previewHTML = `<div class="preview-stats">
          <p>Found ${importData.folders.length} folders with ${countTotalPrompts(importData.folders)} prompts</p>
        </div>
        <div class="preview-folders">
          ${importData.folders.map(folder => `
            <div class="preview-folder">
              <strong>${folder.name}</strong> (${folder.prompts.length} prompts)
            </div>
          `).join('')}
        </div>`;
      } else {
        throw new Error('Unsupported file format');
      }
      
      // Store the parsed data for later use
      window.importData = importData;
      
      // Update preview and enable import button
      previewContent.innerHTML = previewHTML;
      confirmButton.disabled = false;
      
    } catch (error) {
      previewContent.innerHTML = `<div class="error">Error parsing file: ${error.message}</div>`;
      confirmButton.disabled = true;
    }
  };
  
  reader.onerror = function() {
    previewContent.innerHTML = '<div class="error">Error reading file</div>';
    confirmButton.disabled = true;
  };
  
  if (file.name.endsWith('.json') || file.name.endsWith('.csv')) {
    reader.readAsText(file);
  } else {
    previewContent.innerHTML = '<div class="error">Unsupported file format. Please select a .json or .csv file.</div>';
    confirmButton.disabled = true;
  }
}

// Parse CSV data
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Check required columns
  const requiredColumns = ['Folder', 'Title', 'Content'];
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }
  
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    // Handle commas within quoted fields
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue); // Add the last value
    
    // Create object with headers as keys
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].replace(/^"|"$/g, '') : ''; // Remove surrounding quotes
    });
    
    result.push(row);
  }
  
  return result;
}

// Convert CSV data to state format
function convertCSVToState(csvData) {
  const folders = {};
  
  csvData.forEach(row => {
    const folderName = row.Folder.trim();
    const promptTitle = row.Title.trim();
    const promptContent = row.Content.trim();
    
    if (!folderName || !promptTitle || !promptContent) return;
    
    // Create folder if it doesn't exist
    if (!folders[folderName]) {
      folders[folderName] = {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        name: folderName,
        prompts: []
      };
    }
    
    // Add prompt to folder
    folders[folderName].prompts.push({
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      title: promptTitle,
      content: promptContent
    });
  });
  
  return {
    folders: Object.values(folders)
  };
}

// Count total prompts in folders
function countTotalPrompts(folders) {
  return folders.reduce((total, folder) => total + folder.prompts.length, 0);
}

// Import prompts from file
async function confirmImport() {
  const importMode = document.querySelector('input[name="importMode"]:checked');
  if (!importMode) {
    console.error("Import mode radio buttons not found");
    return;
  }
  
  const mode = importMode.value;
  const importData = window.importData;
  
  if (!importData) {
    console.error("No import data available");
    return;
  }
  
  try {
    if (mode === 'replace') {
      // Replace entire library
      state.folders = importData.folders;
    } else {
      // Merge with existing library
      importData.folders.forEach(importFolder => {
        // Check if folder with same name exists
        const existingFolder = state.folders.find(f => f.name === importFolder.name);
        
        if (existingFolder) {
          // Merge prompts into existing folder
          importFolder.prompts.forEach(importPrompt => {
            // Check for duplicate prompt titles
            const existingPrompt = existingFolder.prompts.find(p => p.title === importPrompt.title);
            
            if (!existingPrompt) {
              // Add new prompt with new ID
              existingFolder.prompts.push({
                id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                title: importPrompt.title,
                content: importPrompt.content
              });
            }
          });
        } else {
          // Add new folder
          state.folders.push({
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            name: importFolder.name,
            prompts: importFolder.prompts.map(p => ({
              id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
              title: p.title,
              content: p.content
            }))
          });
        }
      });
    }
    
    // Save state and update UI
    await saveState();
    renderLibrary();
    
    // Close modal and show success notification
    const importModal = document.getElementById('importModal');
    if (importModal) {
      importModal.style.display = 'none';
    }
    
    showNotification('Import completed successfully!');
    
  } catch (error) {
    console.error('Import error:', error);
    showNotification('Error during import', true);
  }
}

// Show notification
function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.className = isError ? 'notification error' : 'notification success';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}
  



// LLM Settings and Integration for popup.js

// LLM Settings
let llmSettings = {
  chatgpt: 'https://chat.openai.com/',
  claude: 'https://claude.ai/new',
  perplexity: 'https://www.perplexity.ai/',
  grok: 'https://grok.com/',
  defaultLLM: 'chatgpt'
};

// Store prompt-specific LLM preferences
let promptLLMPreferences = {};

// Current prompt being edited for LLM settings
let currentPromptId = null;

// Setup event listeners for LLM features
function setupLLMFeatures() {
  // Load LLM settings
  loadLLMSettings();
  
  // Add settings button to header
  // const headerActions = document.querySelector('.button-row');
  // const settingsButton = document.createElement('button');
  // settingsButton.id = 'llmSettings';
  // settingsButton.className = 'action-btn';
  // settingsButton.textContent = 'LLM Settings';
  // headerActions.appendChild(settingsButton);
  
  // Settings button click event
  document.getElementById('llmSettings').addEventListener('click', showLLMSettingsModal);
  document.getElementById('saveLLMSettings').addEventListener('click', saveLLMSettings);
  document.getElementById('cancelLLMSettings').addEventListener('click', () => {
    document.getElementById('llmSettingsModal').style.display = 'none';
  });
  
  // Prompt-specific LLM settings
  document.getElementById('savePromptLLM').addEventListener('click', savePromptLLMPreference);
  document.getElementById('cancelPromptLLM').addEventListener('click', () => {
    document.getElementById('promptLLMModal').style.display = 'none';
  });
  
  // Add dropdown event listeners after DOM is updated
  document.addEventListener('click', function(e) {
    if (e.target.matches('.action-btn')) {
      closeAllDropdowns();
      e.target.nextElementSibling.classList.toggle('show');
      e.stopPropagation();
    } else if (e.target.matches('.dropdown-submenu-title')) {
      e.target.nextElementSibling.classList.toggle('show');
      e.stopPropagation();
    } else if (e.target.matches('.send-to-default')) {
      e.preventDefault();
      sendToDefaultLLM(e.target.dataset.promptId);
      closeAllDropdowns();
    } else if (e.target.matches('.send-to-llm')) {
      e.preventDefault();
      sendToLLM(e.target.dataset.promptId, e.target.dataset.llm);
      closeAllDropdowns();
    } else if (e.target.matches('.set-default-llm')) {
      e.preventDefault();
      showPromptLLMModal(e.target.dataset.promptId);
      closeAllDropdowns();
    } else {
      closeAllDropdowns();
    }
  });
}

// Close all open dropdowns
function closeAllDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown-content, .dropdown-submenu-content');
  dropdowns.forEach(dropdown => {
    dropdown.classList.remove('show');
  });
}

// Load LLM settings from storage
async function loadLLMSettings() {
  const result = await chrome.storage.local.get(['llmSettings', 'promptLLMPreferences']);
  if (result.llmSettings) {
    llmSettings = result.llmSettings;
  }
  if (result.promptLLMPreferences) {
    promptLLMPreferences = result.promptLLMPreferences;
  }
}

// Save LLM settings to storage
async function saveLLMSettings() {
  // Get values from form
  llmSettings = {
    chatgpt: document.getElementById('chatgptUrl').value,
    claude: document.getElementById('claudeUrl').value,
    perplexity: document.getElementById('perplexityUrl').value,
    grok: document.getElementById('grokUrl').value,
    defaultLLM: document.getElementById('defaultLLM').value
  };
  
  // Save to storage
  await chrome.storage.local.set({ llmSettings });
  
  // Close modal and show notification
  document.getElementById('llmSettingsModal').style.display = 'none';
  showNotification('LLM settings saved successfully!');
}

// Show LLM settings modal
function showLLMSettingsModal() {
  // Populate form with current settings
  document.getElementById('chatgptUrl').value = llmSettings.chatgpt;
  document.getElementById('claudeUrl').value = llmSettings.claude;
  document.getElementById('perplexityUrl').value = llmSettings.perplexity;
  document.getElementById('grokUrl').value = llmSettings.grok;
  document.getElementById('defaultLLM').value = llmSettings.defaultLLM;
  
  // Show modal
  document.getElementById('llmSettingsModal').style.display = 'block';
}

// Show prompt-specific LLM settings modal
function showPromptLLMModal(promptId) {
  currentPromptId = promptId;
  
  // Set current value if exists
  const select = document.getElementById('promptDefaultLLM');
  select.value = promptLLMPreferences[promptId] || 'global';
  
  // Show modal
  document.getElementById('promptLLMModal').style.display = 'block';
}

// Save prompt-specific LLM preference
async function savePromptLLMPreference() {
  if (!currentPromptId) return;
  
  const llm = document.getElementById('promptDefaultLLM').value;
  
  // If global is selected, remove the preference
  if (llm === 'global') {
    delete promptLLMPreferences[currentPromptId];
  } else {
    promptLLMPreferences[currentPromptId] = llm;
  }
  
  // Save to storage
  await chrome.storage.local.set({ promptLLMPreferences });
  
  // Close modal and show notification
  document.getElementById('promptLLMModal').style.display = 'none';
  showNotification('Prompt LLM preference saved!');
}

// Get the prompt by ID
function getPromptById(promptId) {
  for (const folder of state.folders) {
    const prompt = folder.prompts.find(p => p.id === promptId);
    if (prompt) return prompt;
  }
  return null;
}

// Send prompt to default LLM
function sendToDefaultLLM(promptId) {
  const prompt = getPromptById(promptId);
  if (!prompt) return;
  
  // Check if this prompt has a specific default LLM
  const llm = promptLLMPreferences[promptId] || llmSettings.defaultLLM;
  
  sendToLLM(promptId, llm);
}

// Send prompt to specific LLM
async function sendToLLM(promptId, llmKey) {
  const prompt = getPromptById(promptId);
  if (!prompt) return;
  
  // Get LLM URL
  const llmUrl = llmSettings[llmKey];
  if (!llmUrl) {
    showNotification('LLM URL not configured', true);
    return;
  }
  
  try {
    // Copy prompt to clipboard
    await navigator.clipboard.writeText(prompt.content);
    
    // Open LLM in new tab
    chrome.tabs.create({ url: llmUrl });
    
    showNotification(`Prompt copied and opening ${llmKey.charAt(0).toUpperCase() + llmKey.slice(1)}...`);
  } catch (error) {
    console.error('Error sending to LLM:', error);
    showNotification('Error sending prompt to LLM', true);
  }
}   
   