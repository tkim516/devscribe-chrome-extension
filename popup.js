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

// Helper function for robust error handling
function safeExecute(fn, fallback = null) {
  try {
    return fn();
  } catch (error) {
    console.error("Error in extension operation:", error);
    chrome.runtime.sendMessage({ type: "logError", error: error.message });
    return fallback;
  }
}

// Logging helper to send logs to background script
function logToBackground(message) {
  chrome.runtime.sendMessage({ type: "log", message: message });
}

document.addEventListener('DOMContentLoaded', async () => {
  logToBackground("DOM content loaded event triggered");
  try {
    console.log("DOM fully loaded");
    logToBackground("DOM fully loaded");
    // Increased delay to 100ms to handle potential race conditions
    setTimeout(async () => {
      try {
        logToBackground("Starting state load");
        await loadState();
        console.log("State loaded");
        logToBackground("State loaded successfully");
        setupEventListeners();
        console.log("Event listeners set up - checking setupImportExportListeners");
        setupImportExportListeners();
        console.log("setupImportExportListeners completed");
        console.log("Event listeners set up - checking setupLLMFeatures");
        setupLLMFeatures();
        console.log("setupLLMFeatures completed");
        console.log("Event listeners set up");
        logToBackground("Event listeners set up");
        
        // Add detailed post-setup logging and error handling
        console.log("Checking for post-setup issues");
        try {
          // Simulate a small delay to catch timing issues
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log("Post-setup delay completed - extension still running");
          logToBackground("Post-setup delay completed");
          
          // Add additional checks and logging after the delay
          console.log("Verifying extension stability");
          try {
            // Check for DOM elements or state to ensure stability
            const testElement = document.querySelector('.container');
            if (testElement) {
              console.log("Container element found, extension stable");
              logToBackground("Container element found, extension stable");
            } else {
              console.error("Container element not found after setup");
              logToBackground("Error: Container element not found after setup");
            }
            
            // Test createFolder button existence with error handling
            console.log("Testing createFolder button existence");
            logToBackground("Testing createFolder button existence");
            const createFolderBtn = document.getElementById('createFolder');
            if (createFolderBtn) {
              console.log("createFolder button found, testing stability");
              logToBackground("createFolder button found, testing stability");
            } else {
              console.error("createFolder button not found");
              logToBackground("Error: createFolder button not found");
            }
            
            // Test background communication with detailed error handling
            console.log("Sending postSetupCheck to background");
            logToBackground("Sending postSetupCheck to background");
            chrome.runtime.sendMessage({ type: 'postSetupCheck' }, (response) => {
              if (chrome.runtime.lastError) {
                console.error("Post-setup communication error:", chrome.runtime.lastError.message);
                logToBackground("Post-setup communication error: " + chrome.runtime.lastError.message);
              } else if (response) {
                console.log("Background responded:", response);
                logToBackground("Background responded successfully: " + JSON.stringify(response));
              } else {
                console.warn("No response from background");
                logToBackground("Warning: No response from background");
              }
            });
            
            // Add a final stability check after communication
            console.log("Final stability check - extension still running");
            logToBackground("Final stability check - extension still running");
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log("Extension stable after all checks");
            logToBackground("Extension stable after all checks");
          } catch (stabilityError) {
            console.error("Stability check error:", stabilityError);
            logToBackground("Stability check error: " + stabilityError.message);
          }
        } catch (postSetupError) {
          console.error("Post-setup error:", postSetupError);
          logToBackground("Post-setup error: " + postSetupError.message);
          showNotification("Error after setup - please reload the extension", true);
        }
      } catch (stateError) {
        console.error("Error loading state:", stateError);
        logToBackground("Error loading state: " + stateError.message);
        showNotification("Error loading your prompt library", true);
      }
    }, 100); // Increased from 0 to 100ms
  } catch (error) {
    console.error("Critical error during initialization:", error);
    logToBackground("Critical initialization error: " + error.message);
    const container = document.querySelector('.container');
    if (container) {
      container.innerHTML = `
        <div class="error-container">
          <h2>Error Loading Extension</h2>
          <p>There was a problem loading PromptPilot. Please try reloading the extension.</p>
        </div>
      `;
    }
  }
});

// Modified loadState with state validation and logging
async function loadState() {
  logToBackground("Starting loadState");
  const result = await chrome.storage.local.get(['promptManager']);
  logToBackground("Retrieved data from storage");
  if (result.promptManager) {
    const loadedState = result.promptManager;
    if (!loadedState.folders || !Array.isArray(loadedState.folders)) {
      logToBackground("Invalid stored state, resetting to default");
      state = DEFAULT_STATE;
      await saveState();
    } else {
      state = loadedState;
      logToBackground("State validated and loaded");
    }
  } else {
    state = DEFAULT_STATE;
    await saveState();
    logToBackground("Default state applied and saved");
  }
  logToBackground("Calling renderLibrary");
  renderLibrary();
  logToBackground("loadState completed");
}

// Save state to storage
async function saveState() {
  await chrome.storage.local.set({ promptManager: state });
}

function setupEventListeners() {
  safeExecute(() => {
    console.log("Starting event listener setup");

    // Listener for 'createFolder'
    console.log("Setting up createFolder listener");
    const createFolder = document.getElementById('createFolder');
    if (createFolder) {
      createFolder.addEventListener('click', () => {
        showFolderModal();
      });
      console.log("createFolder listener set up successfully");
      logToBackground("createFolder listener set up successfully");
    } else {
      console.error("Element 'createFolder' not found in DOM");
      logToBackground("Error: Element 'createFolder' not found in DOM");
    }

    // Listener for 'searchPrompts'
    console.log("Setting up searchPrompts listener");
    const searchPrompts = document.getElementById('searchPrompts');
    if (searchPrompts) {
      searchPrompts.addEventListener('input', handleSearch);
      console.log("searchPrompts listener set up successfully");
      logToBackground("searchPrompts listener set up successfully");
    } else {
      console.error("Element 'searchPrompts' not found in DOM");
      logToBackground("Error: Element 'searchPrompts' not found in DOM");
    }

    // Listener for 'saveFolder'
    console.log("Setting up saveFolder listener");
    const saveFolder = document.getElementById('saveFolder');
    if (saveFolder) {
      saveFolder.addEventListener('click', handleFolderSave);
      console.log("saveFolder listener set up successfully");
      logToBackground("saveFolder listener set up successfully");
    } else {
      console.error("Element 'saveFolder' not found in DOM");
      logToBackground("Error: Element 'saveFolder' not found in DOM");
    }

    // Listener for 'savePrompt'
    console.log("Setting up savePrompt listener");
    const savePrompt = document.getElementById('savePrompt');
    if (savePrompt) {
      savePrompt.addEventListener('click', handlePromptSave);
      console.log("savePrompt listener set up successfully");
      logToBackground("savePrompt listener set up successfully");
    } else {
      console.error("Element 'savePrompt' not found in DOM");
      logToBackground("Error: Element 'savePrompt' not found in DOM");
    }

    // Listener for 'cancelFolder'
    console.log("Setting up cancelFolder listener");
    const cancelFolder = document.getElementById('cancelFolder');
    if (cancelFolder) {
      cancelFolder.addEventListener('click', () => {
        const folderModal = document.getElementById('folderModal');
        if (folderModal) folderModal.style.display = 'none';
      });
      console.log("cancelFolder listener set up successfully");
      logToBackground("cancelFolder listener set up successfully");
    } else {
      console.error("Element 'cancelFolder' not found in DOM");
      logToBackground("Error: Element 'cancelFolder' not found in DOM");
    }

    // Listener for 'cancelPrompt'
    console.log("Setting up cancelPrompt listener");
    const cancelPrompt = document.getElementById('cancelPrompt');
    if (cancelPrompt) {
      cancelPrompt.addEventListener('click', () => {
        const promptModal = document.getElementById('promptModal');
        if (promptModal) promptModal.style.display = 'none';
      });
      console.log("cancelPrompt listener set up successfully");
      logToBackground("cancelPrompt listener set up successfully");
    } else {
      console.error("Element 'cancelPrompt' not found in DOM");
      logToBackground("Error: Element 'cancelPrompt' not found in DOM");
    }

    console.log("All event listeners set up");
    logToBackground("All event listeners set up");
  });
}

// Show folder modal
function showFolderModal(isEdit = false, folder = null) {
  safeExecute(() => {
    const modal = document.getElementById('folderModal');
    const titleEl = document.getElementById('folderModalTitle');
    const nameInput = document.getElementById('folderName');
    const saveButton = document.getElementById('saveFolder');
    
    if (!modal || !titleEl || !nameInput || !saveButton) {
      console.error("Required folder modal elements not found");
      return;
    }
    
    titleEl.textContent = isEdit ? 'Edit Folder' : 'Create New Folder';
    
    if (isEdit && folder) {
      nameInput.value = folder.name;
      nameInput.dataset.originalName = folder.name;
      saveButton.disabled = true;
      nameInput.addEventListener('input', checkFolderChanges);
    } else {
      nameInput.value = '';
      delete nameInput.dataset.originalName;
      saveButton.disabled = false;
      nameInput.removeEventListener('input', checkFolderChanges);
    }
    
    modal.style.display = 'block';
    nameInput.focus();
  });
}

// Check for folder changes
function checkFolderChanges() {
  safeExecute(() => {
    const nameInput = document.getElementById('folderName');
    const saveButton = document.getElementById('saveFolder');
    
    if (!nameInput || !saveButton) return;
    
    if (nameInput.dataset.originalName !== undefined) {
      saveButton.disabled = nameInput.value.trim() === nameInput.dataset.originalName;
    }
  });
}

// Handle folder save
async function handleFolderSave() {
  return safeExecute(async () => {
    const nameInput = document.getElementById('folderName');
    if (!nameInput) return;
    
    const name = nameInput.value.trim();
    if (!name) return;
    
    if (nameInput.dataset.originalName !== undefined) {
      const folder = state.folders.find(f => f.name === nameInput.dataset.originalName);
      if (folder) {
        folder.name = name;
      }
    } else {
      const newFolder = {
        id: Date.now().toString(),
        name,
        prompts: []
      };
      state.folders.push(newFolder);
    }
    
    await saveState();
    renderLibrary();
    
    const folderModal = document.getElementById('folderModal');
    if (folderModal) folderModal.style.display = 'none';
    
    nameInput.value = '';
    delete nameInput.dataset.originalName;
  });
}

// Show prompt modal
function showPromptModal(folderId, isEdit = false, prompt = null) {
  safeExecute(() => {
    const modal = document.getElementById('promptModal');
    const titleEl = document.getElementById('modalTitle');
    const promptTitleInput = document.getElementById('promptTitle');
    const promptContentInput = document.getElementById('promptContent');
    const saveButton = document.getElementById('savePrompt');
    
    if (!modal || !titleEl || !promptTitleInput || !promptContentInput || !saveButton) {
      console.error("Required prompt modal elements not found");
      return;
    }
    
    titleEl.textContent = isEdit ? 'Edit Prompt' : 'Create New Prompt';
    
    if (isEdit && prompt) {
      promptTitleInput.value = prompt.title;
      promptContentInput.value = prompt.content;
      promptTitleInput.dataset.originalTitle = prompt.title;
      promptContentInput.dataset.originalContent = prompt.content;
      saveButton.disabled = true;
      promptTitleInput.addEventListener('input', checkPromptChanges);
      promptContentInput.addEventListener('input', checkPromptChanges);
    } else {
      promptTitleInput.value = '';
      promptContentInput.value = '';
      delete promptTitleInput.dataset.originalTitle;
      delete promptContentInput.dataset.originalContent;
      saveButton.disabled = false;
      promptTitleInput.removeEventListener('input', checkPromptChanges);
      promptContentInput.removeEventListener('input', checkPromptChanges);
    }
    
    state.currentFolder = folderId;
    state.editingPromptId = isEdit ? prompt.id : null;
    
    modal.style.display = 'block';
    promptTitleInput.focus();
  });
}

// Check for prompt changes
function checkPromptChanges() {
  safeExecute(() => {
    const titleInput = document.getElementById('promptTitle');
    const contentInput = document.getElementById('promptContent');
    const saveButton = document.getElementById('savePrompt');
    
    if (!titleInput || !contentInput || !saveButton) return;
    
    if (titleInput.dataset.originalTitle !== undefined && contentInput.dataset.originalContent !== undefined) {
      const titleChanged = titleInput.value.trim() !== titleInput.dataset.originalTitle;
      const contentChanged = contentInput.value.trim() !== contentInput.dataset.originalContent;
      saveButton.disabled = !(titleChanged || contentChanged);
    }
  });
}

// Handle prompt save
async function handlePromptSave() {
  return safeExecute(async () => {
    const titleInput = document.getElementById('promptTitle');
    const contentInput = document.getElementById('promptContent');
    
    if (!titleInput || !contentInput) return;
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) return;
    
    const folder = state.folders.find(f => f.id === state.currentFolder);
    if (!folder) return;
    
    if (state.editingPromptId) {
      const promptIndex = folder.prompts.findIndex(p => p.id === state.editingPromptId);
      if (promptIndex !== -1) {
        folder.prompts[promptIndex].title = title;
        folder.prompts[promptIndex].content = content;
      }
    } else {
      const newPrompt = {
        id: Date.now().toString(),
        title,
        content
      };
      folder.prompts.push(newPrompt);
    }
    
    await saveState();
    renderLibrary();
    
    const promptModal = document.getElementById('promptModal');
    if (promptModal) promptModal.style.display = 'none';
    
    titleInput.value = '';
    contentInput.value = '';
  });
}

// Handle delete
async function handleDelete(folderId, promptId = null) {
  return safeExecute(async () => {
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
  });
}

// Handle search
function handleSearch(event) {
  safeExecute(() => {
    if (!event || !event.target) return;
    
    const searchTerm = event.target.value.toLowerCase();
    const folders = document.querySelectorAll('.folder');
    
    folders.forEach(folder => {
      const folderNameElement = folder.querySelector('.folder-name');
      if (!folderNameElement) return;
      
      const folderName = folderNameElement.textContent.toLowerCase();
      const prompts = folder.querySelectorAll('.prompt-item');
      let hasMatch = folderName.includes(searchTerm);
      
      prompts.forEach(prompt => {
        const promptTitleElement = prompt.querySelector('.prompt-title');
        if (!promptTitleElement) return;
        
        const promptText = promptTitleElement.textContent.toLowerCase();
        const match = promptText.includes(searchTerm);
        prompt.style.display = match ? 'flex' : 'none';
        hasMatch = hasMatch || match;
      });
      
      folder.style.display = hasMatch ? 'block' : 'none';
    });
  });
}

// Copy prompt to clipboard
async function copyPrompt(promptContent) {
  return safeExecute(async () => {
    try {
      await navigator.clipboard.writeText(promptContent);
      const notification = document.createElement('div');
      notification.className = 'copy-notification';
      notification.textContent = 'Copied to clipboard!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
}

/*// Simplified renderLibrary for debugging (temporarily)
function renderLibrary() {
  safeExecute(() => {
    logToBackground("Starting simplified renderLibrary");
    const container = document.getElementById("promptLibrary");
    if (!container) {
      logToBackground('Element "promptLibrary" not found');
      return;
    }
    requestAnimationFrame(() => {
      container.innerHTML = `<div>Test content</div>`;
      logToBackground("Simplified renderLibrary completed");
    });
  });
} /*/

// Original renderLibrary (commented out for debugging)

function renderLibrary() {
  safeExecute(() => {
    logToBackground("Starting renderLibrary");
    const container = document.getElementById('promptLibrary');
    if (!container) {
      console.error('Element with ID "promptLibrary" not found');
      logToBackground('Element "promptLibrary" not found');
      return;
    }
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    if (!state.folders || !Array.isArray(state.folders)) {
      console.error("Invalid state structure, folders not found or not an array");
      logToBackground("Invalid state structure");
      container.innerHTML = `<div class="error">Error loading your prompt library</div>`;
      return;
    }
    state.folders.forEach((folder, index) => {
      logToBackground(`Rendering folder ${index + 1}: ${folder.name}`);
      const folderEl = document.createElement('div');
      folderEl.className = 'folder';
      folderEl.innerHTML = `
        <div class="folder-header">
          <span class="folder-name">${folder.name || 'Unnamed Folder'}</span>
          <div class="actions">
            <button class="btn add-prompt">Add</button>
            <button class="btn mod-folder">Edit</button>
            <button class="btn del-folder">Delete</button>
          </div>
        </div>
        <div class="folder-content">
          ${Array.isArray(folder.prompts) ? folder.prompts.map(prompt => {
            if (!prompt || typeof prompt !== 'object') return '';
            return `
              <div class="prompt-item">
                <span class="prompt-title">${prompt.title || 'Untitled'}</span>
                <div class="actions">
                  <button class="btn copy-prompt" data-content="${(prompt.content || '').replace(/"/g, '&quot;')}">Copy</button>
                  <div class="dropdown">
                    <button class="btn action-btn">Open with LLM</button>
                    <div class="dropdown-content">
                      <a href="#" class="send-to-default" data-prompt-id="${prompt.id}">Send to Default LLM</a>                    
                      <a href="#" class="send-to-llm" data-llm="chatgpt" data-prompt-id="${prompt.id}">ChatGPT</a>
                      <a href="#" class="send-to-llm" data-llm="claude" data-prompt-id="${prompt.id}">Claude</a>
                      <a href="#" class="send-to-llm" data-llm="perplexity" data-prompt-id="${prompt.id}">Perplexity</a>
                      <a href="#" class="send-to-llm" data-llm="grok" data-prompt-id="${prompt.id}">Grok</a>
                      <a href="#" class="set-default-llm" data-prompt-id="${prompt.id}">Set Default LLM</a>
                    </div>
                  </div>
                  <button class="btn mod-prompt">Edit</button>
                  <button class="btn del-prompt">Delete</button>
                </div>
              </div>
            `;
          }).join('') : ''}
        </div>
      `;
      safeExecute(() => {
        const header = folderEl.querySelector('.folder-header');
        const content = folderEl.querySelector('.folder-content');
        if (header && content) {
          header.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn')) {
              content.classList.toggle('open');
            }
          });
        }
        const addPromptBtn = folderEl.querySelector('.add-prompt');
        if (addPromptBtn) {
          addPromptBtn.addEventListener('click', () => {
            showPromptModal(folder.id);
          });
        }
        const modFolderBtn = folderEl.querySelector('.mod-folder');
        if (modFolderBtn) {
          modFolderBtn.addEventListener('click', () => {
            showFolderModal(true, folder);
          });
        }
        const delFolderBtn = folderEl.querySelector('.del-folder');
        if (delFolderBtn) {
          delFolderBtn.addEventListener('click', () => {
            handleDelete(folder.id);
          });
        }
        const copyButtons = folderEl.querySelectorAll('.copy-prompt');
        copyButtons.forEach(button => {
          button.addEventListener('click', () => {
            if (button.dataset && button.dataset.content) {
              copyPrompt(button.dataset.content);
            }
          });
        });
        const modPromptButtons = folderEl.querySelectorAll('.mod-prompt');
        if (modPromptButtons.length > 0 && Array.isArray(folder.prompts)) {
          modPromptButtons.forEach((button, index) => {
            if (index < folder.prompts.length) {
              button.addEventListener('click', () => {
                showPromptModal(folder.id, true, folder.prompts[index]);
              });
            }
          });
        }
        
        const delPromptButtons = folderEl.querySelectorAll('.del-prompt');
        if (delPromptButtons.length > 0 && Array.isArray(folder.prompts)) {
          delPromptButtons.forEach((button, index) => {
            if (index < folder.prompts.length) {
              button.addEventListener('click', () => {
                handleDelete(folder.id, folder.prompts[index].id);
              });
            }
          });
        }
      });
      container.appendChild(folderEl);
      logToBackground(`Folder ${folder.name} rendered`);
    });
    logToBackground("renderLibrary completed");
  });
}


// Setup import/export listeners
function setupImportExportListeners() {
  safeExecute(() => {
    console.log("Setting up import/export listeners");
    const exportBtn = document.getElementById('exportPrompts');
    const importBtn = document.getElementById('importPrompts');
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
          console.error("Import modal not found");
        }
      });
    } else {
      console.error("Import button not found");
    }
    const importFile = document.getElementById('importFile');
    if (importFile) {
      importFile.addEventListener('change', function(event) {
        safeExecute(() => {
          const previewContent = document.getElementById('previewContent');
          const confirmButton = document.getElementById('confirmImport');
          if (previewContent) {
            previewContent.innerHTML = '<div class="loading">Processing file...</div>';
          }
          if (confirmButton) {
            confirmButton.disabled = true;
          }
          setTimeout(() => {
            safeExecute(() => {
              handleFileSelect(event);
            });
          }, 100);
        });
      });
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
  });
}

// Export prompt library
function exportPromptLibrary() {
  safeExecute(() => {
    const formatModal = document.createElement('div');
    formatModal.className = 'format-modal';
    formatModal.innerHTML = `
      <div class="format-modal-content">
        <h3>Choose Export Format</h3>
        <div class="format-options">
          <label>
            <input type="radio" name="exportFormat" value="json" checked> JSON
          </label>
          <label>
            <input type="radio" name="exportFormat" value="csv"> CSV
          </label>
        </div>
        <div class="modal-buttons">
          <button id="confirmExport" class="btn primary">Export</button>
          <button id="cancelExport" class="btn">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(formatModal);
    document.getElementById('confirmExport').addEventListener('click', () => {
      const format = document.querySelector('input[name="exportFormat"]:checked').value;
      if (format === 'json') {
        exportAsJson();
      } else {
        exportAsCsv();
      }
      formatModal.remove();
    });
    document.getElementById('cancelExport').addEventListener('click', () => {
      formatModal.remove();
    });
  });
}

// Export as JSON
function exportAsJson() {
  safeExecute(() => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'promptpilot-export.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showNotification('Library exported as JSON successfully!');
  });
}

// Export as CSV
function exportAsCsv() {
  safeExecute(() => {
    let csvContent = 'Folder,Title,Content\n';
    state.folders.forEach(folder => {
      const folderName = escapeCsvField(folder.name);
      folder.prompts.forEach(prompt => {
        const title = escapeCsvField(prompt.title);
        const content = escapeCsvField(prompt.content);
        csvContent += `${folderName},${title},${content}\n`;
      });
    });
    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
    const exportFileDefaultName = 'promptpilot-export.csv';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showNotification('Library exported as CSV successfully!');
  });
}

// Escape CSV fields
function escapeCsvField(field) {
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
// Manual CSV parser
function parseCSVManually(csvText) {
  try {
    csvText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = csvText.split('\n');
    if (!lines.length) {
      return { success: false, error: 'Empty CSV file' };
    }
    const headerLine = lines[0].trim();
    if (!headerLine) {
      return { success: false, error: 'CSV header row is empty' };
    }
    const headers = parseCSVLine(headerLine);
    const requiredColumns = ['folder', 'title', 'content'];
    const lowerHeaders = headers.map(h => h.toLowerCase());
    const missingColumns = requiredColumns.filter(
      col => !lowerHeaders.includes(col.toLowerCase())
    );
    if (missingColumns.length > 0) {
      return {
        success: false,
        error: `Missing required columns: ${missingColumns.join(', ')}`
      };
    }
    const folderIndex = lowerHeaders.indexOf('folder');
    const titleIndex = lowerHeaders.indexOf('title');
    const contentIndex = lowerHeaders.indexOf('content');
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      try {
        const fields = parseCSVLine(line);
        if (fields.length <= Math.max(folderIndex, titleIndex, contentIndex)) {
          console.warn(`Line ${i+1} has too few fields, skipping`);
          continue;
        }
        const folder = fields[folderIndex]?.trim() || '';
        const title = fields[titleIndex]?.trim() || '';
        const content = fields[contentIndex]?.trim() || '';
        if (folder && title && content) {
          data.push({ Folder: folder, Title: title, Content: content });
        } else {
          console.warn(`Line ${i+1} is missing required data, skipping`);
        }
      } catch (lineErr) {
        console.error(`Error parsing line ${i+1}:`, lineErr, "Line:", line);
      }
    }
    if (data.length === 0) {
      return { success: false, error: 'No valid data rows found in CSV' };
    }
    return { success: true, data };
  } catch (error) {
    console.error("CSV parsing error:", error);
    return { success: false, error: error.message };
  }
}

// Parse CSV line
function parseCSVLine(line) {
  const result = [];
  let start = 0;
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuote = !inQuote;
    } else if (line[i] === ',' && !inQuote) {
      let field = line.substring(start, i);
      if (field.startsWith('"') && field.endsWith('"')) {
        field = field.substring(1, field.length - 1).replace(/""/g, '"');
      }
      result.push(field);
      start = i + 1;
    }
  }
  let lastField = line.substring(start);
  if (lastField.startsWith('"') && lastField.endsWith('"')) {
    lastField = lastField.substring(1, lastField.length - 1).replace(/""/g, '"');
  }
  result.push(lastField);
  return result;
}

// Convert CSV data to state
function convertCSVDataToState(csvData) {
  console.log("Converting CSV data to state format");
  const folderMap = {};
  csvData.forEach((row, index) => {
    const folderName = row.Folder;
    const promptTitle = row.Title;
    const promptContent = row.Content;
    if (!folderName || !promptTitle || !promptContent) {
      console.warn(`Row ${index} has missing data, skipping`);
      return;
    }
    if (!folderMap[folderName]) {
      folderMap[folderName] = {
        id: `import-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
        name: folderName,
        prompts: []
      };
    }
    folderMap[folderName].prompts.push({
      id: `prompt-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
      title: promptTitle,
      content: promptContent
    });
  });
  return {
    folders: Object.values(folderMap)
  };
}

// Generate preview HTML
function generatePreviewHTML(importData) {
  const totalPrompts = importData.folders.reduce((sum, folder) => sum + folder.prompts.length, 0);
  let html = `
    <div class="preview-stats">
      <p>Found ${importData.folders.length} folders with ${totalPrompts} prompts</p>
    </div>
    <div class="preview-folders">
  `;
  importData.folders.forEach(folder => {
    html += `
      <div class="preview-folder">
        <strong>${escapeHTML(folder.name)}</strong> (${folder.prompts.length} prompts)
        <div class="preview-prompts">
    `;
    const previewPrompts = folder.prompts.slice(0, 3);
    previewPrompts.forEach(prompt => {
      html += `<div class="preview-prompt-title">• ${escapeHTML(prompt.title)}</div>`;
    });
    if (folder.prompts.length > 3) {
      html += `<div class="preview-more">...and ${folder.prompts.length - 3} more</div>`;
    }
    html += `</div></div>`;
  });
  html += `</div>`;
  return html;
}

// Escape HTML
function escapeHTML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Confirm import
async function confirmImport() {
  return safeExecute(async () => {
    console.log("Starting import confirmation");
    const importModeElem = document.querySelector('input[name="importMode"]:checked');
    if (!importModeElem) {
      throw new Error("No import mode selected");
    }
    const importMode = importModeElem.value;
    console.log("Import mode:", importMode);
    const importData = window.importData;
    if (!importData || !importData.folders) {
      throw new Error("No valid import data available");
    }
    console.log(`Importing ${importData.folders.length} folders`);
    if (importMode === 'replace') {
      state.folders = JSON.parse(JSON.stringify(importData.folders));
      console.log("Replaced library with imported data");
    } else {
      console.log(`Merging with existing library (${state.folders.length} folders)`);
      importData.folders.forEach(importFolder => {
        const existingFolder = state.folders.find(
          f => f.name.toLowerCase() === importFolder.name.toLowerCase()
        );
        if (existingFolder) {
          console.log(`Merging with existing folder: ${existingFolder.name}`);
          importFolder.prompts.forEach(importPrompt => {
            const existingPrompt = existingFolder.prompts.find(
              p => p.title.toLowerCase() === importPrompt.title.toLowerCase()
            );
            if (!existingPrompt) {
              existingFolder.prompts.push({
                id: `import-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                title: importPrompt.title,
                content: importPrompt.content
              });
              console.log(`Added prompt: ${importPrompt.title}`);
            } else {
              console.log(`Skipped duplicate prompt: ${importPrompt.title}`);
            }
          });
        } else {
          console.log(`Adding new folder: ${importFolder.name}`);
          state.folders.push({
            id: `import-folder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: importFolder.name,
            prompts: importFolder.prompts.map(p => ({
              id: `import-prompt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              title: p.title,
              content: p.content
            }))
          });
        }
      });
    }
    await saveState();
    renderLibrary();
    const importModal = document.getElementById('importModal');
    if (importModal) {
      importModal.style.display = 'none';
    }
    showNotification(`Import completed successfully! Added ${importData.folders.reduce((sum, f) => sum + f.prompts.length, 0)} prompts.`);
  }, () => {
    console.error("Import failed with an unhandled error");
    showNotification("Import failed. Please try again.", true);
  });
}

// Show notification
function showNotification(message, isError = false) {
  safeExecute(() => {
    const notification = document.createElement('div');
    notification.className = isError ? 'notification error' : 'notification success';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  });
}

// Handle file selection for import
function handleFileSelect(event) {
  safeExecute(() => {
    console.log("File selection initiated");
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected or file selection cancelled");
      return;
    }
    console.log("File info:", {
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type
    });
    if (file.size > 1024 * 1024) {
      console.warn("Large file detected, processing may take longer");
    }
    const confirmButton = document.getElementById('confirmImport');
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) {
      console.error("Preview content element not found");
      showNotification("Import error: UI elements not found", true);
      return;
    }
    previewContent.innerHTML = '<div class="loading">Analyzing file...</div>';
    if (confirmButton) confirmButton.disabled = true;
    setTimeout(() => {
      try {
        const reader = new FileReader();
        reader.onerror = function(errorEvent) {
          console.error("File read error:", errorEvent);
          if (previewContent) {
            previewContent.innerHTML = '<div class="error">Failed to read file. It may be corrupted.</div>';
          }
          if (confirmButton) confirmButton.disabled = true;
        };
        reader.onload = function(e) {
          setTimeout(() => {
            try {
              const content = e.target?.result;
              if (!content) {
                throw new Error("File appears to be empty");
              }
              let importData;
              if (file.name.endsWith('.json')) {
                try {
                  importData = JSON.parse(content);
                  if (!importData.folders || !Array.isArray(importData.folders)) {
                    throw new Error('Invalid JSON format: missing folders array');
                  }
                  console.log(`JSON parsed: ${importData.folders.length} folders found`);
                } catch (jsonError) {
                  console.error("JSON parse error:", jsonError);
                  if (previewContent) {
                    previewContent.innerHTML = `<div class="error">Invalid JSON format: ${jsonError.message}</div>`;
                  }
                  if (confirmButton) confirmButton.disabled = true;
                  return;
                }
              } else if (file.name.endsWith('.csv')) {
                try {
                  const csvResult = parseCSVManually(content);
                  if (csvResult.success) {
                    importData = convertCSVDataToState(csvResult.data);
                    console.log(`CSV parsed: ${importData.folders.length} folders created`);
                  } else {
                    throw new Error(csvResult.error || "Unknown CSV parsing error");
                  }
                } catch (csvError) {
                  console.error("CSV parse error:", csvError);
                  if (previewContent) {
                    previewContent.innerHTML = `<div class="error">CSV parsing failed: ${csvError.message}</div>`;
                  }
                  if (confirmButton) confirmButton.disabled = true;
                  return;
                }
              } else {
                throw new Error('Unsupported file format');
              }
              setTimeout(() => {
                try {
                  if (importData && importData.folders) {
                    const previewHTML = generatePreviewHTML(importData);
                    if (previewContent) previewContent.innerHTML = previewHTML;
                    window.importData = importData;
                    if (confirmButton) confirmButton.disabled = false;
                  }
                } catch (previewError) {
                  console.error("Error generating preview:", previewError);
                  if (previewContent) {
                    previewContent.innerHTML = `<div class="error">Error generating preview: ${previewError.message}</div>`;
                  }
                }
              }, 0);
            } catch (processingError) {
              console.error("Error processing file content:", processingError);
              if (previewContent) {
                previewContent.innerHTML = `<div class="error">Error processing file: ${processingError.message}</div>`;
              }
              if (confirmButton) confirmButton.disabled = true;
            }
          }, 0);
        };
        if (file.name.endsWith('.json') || file.name.endsWith('.csv')) {
          reader.readAsText(file, 'UTF-8');
        } else {
          if (previewContent) {
            previewContent.innerHTML = '<div class="error">Unsupported file format. Please select a .json or .csv file.</div>';
          }
          if (confirmButton) confirmButton.disabled = true;
        }
      } catch (error) {
        console.error("Fatal error in file processing:", error);
        if (previewContent) {
          previewContent.innerHTML = `<div class="error">Critical error: ${error.message}</div>`;
        }
        if (confirmButton) confirmButton.disabled = true;
      }
    }, 0);
  });
}


// LLM Settings and Integration
let llmSettings = {
  chatgpt: 'https://chat.openai.com/',
  claude: 'https://claude.ai/new',
  perplexity: 'https://www.perplexity.ai/',
  grok: 'https://grok.com/',
  defaultLLM: 'chatgpt'
};
let promptLLMPreferences = {};
let currentPromptId = null;

function setupLLMFeatures() {
  safeExecute(() => {
    loadLLMSettings();
    const llmSettingsBtn = document.getElementById('llmSettings');
    if (llmSettingsBtn) {
      llmSettingsBtn.addEventListener('click', showLLMSettingsModal);
    }
    const saveLLMSettingsBtn = document.getElementById('saveLLMSettings');
    if (saveLLMSettingsBtn) {
      saveLLMSettingsBtn.addEventListener('click', saveLLMSettings);
    }
    const cancelLLMSettingsBtn = document.getElementById('cancelLLMSettings');
    if (cancelLLMSettingsBtn) {
      cancelLLMSettingsBtn.addEventListener('click', () => {
        const modal = document.getElementById('llmSettingsModal');
        if (modal) modal.style.display = 'none';
      });
    }
    const savePromptLLMBtn = document.getElementById('savePromptLLM');
    if (savePromptLLMBtn) {
      savePromptLLMBtn.addEventListener('click', savePromptLLMPreference);
    }
    const cancelPromptLLMBtn = document.getElementById('cancelPromptLLM');
    if (cancelPromptLLMBtn) {
      cancelPromptLLMBtn.addEventListener('click', () => {
        const modal = document.getElementById('promptLLMModal');
        if (modal) modal.style.display = 'none';
      });
    }
    document.addEventListener('click', function(e) {
      safeExecute(() => {
        if (!e || !e.target) return;
        if (e.target.matches('.action-btn')) {
          closeAllDropdowns();
          const dropdown = e.target.nextElementSibling;
          if (dropdown && dropdown.classList) {
            dropdown.classList.toggle('show');
          }
          e.stopPropagation();
        } else if (e.target.matches('.dropdown-submenu-title')) {
          const submenu = e.target.nextElementSibling;
          if (submenu && submenu.classList) {
            submenu.classList.toggle('show');
          }
          e.stopPropagation();
        } else if (e.target.matches('.send-to-default')) {
          e.preventDefault();
          if (typeof e.target.dataset === 'object' && e.target.dataset.promptId) {
            sendToDefaultLLM(e.target.dataset.promptId);
          }
          closeAllDropdowns();
        } else if (e.target.matches('.send-to-llm')) {
          e.preventDefault();
          if (typeof e.target.dataset === 'object' && e.target.dataset.promptId && e.target.dataset.llm) {
            sendToLLM(e.target.dataset.promptId, e.target.dataset.llm);
          }
          closeAllDropdowns();
        } else if (e.target.matches('.set-default-llm')) {
          e.preventDefault();
          if (typeof e.target.dataset === 'object' && e.target.dataset.promptId) {
            showPromptLLMModal(e.target.dataset.promptId);
          }
          closeAllDropdowns();
        } else {
          closeAllDropdowns();
        }
      });
    });
  });
}

function closeAllDropdowns() {
  safeExecute(() => {
    const dropdowns = document.querySelectorAll('.dropdown-content, .dropdown-submenu-content');
    if (!dropdowns || !dropdowns.forEach) return;
    dropdowns.forEach(dropdown => {
      if (dropdown && dropdown.classList) {
        dropdown.classList.remove('show');
      }
    });
  });
}

async function loadLLMSettings() {
  try {
    const result = await chrome.storage.local.get(['llmSettings', 'promptLLMPreferences']);
    if (result.llmSettings) {
      llmSettings = result.llmSettings;
    }
    if (result.promptLLMPreferences) {
      promptLLMPreferences = result.promptLLMPreferences;
    }
  } catch (error) {
    console.error("Error loading LLM settings:", error);
  }
}

async function saveLLMSettings() {
  return safeExecute(async () => {
    const chatgptUrlInput = document.getElementById('chatgptUrl');
    const claudeUrlInput = document.getElementById('claudeUrl');
    const perplexityUrlInput = document.getElementById('perplexityUrl');
    const grokUrlInput = document.getElementById('grokUrl');
    const defaultLLMSelect = document.getElementById('defaultLLM');
    if (!chatgptUrlInput || !claudeUrlInput || !perplexityUrlInput || !grokUrlInput || !defaultLLMSelect) {
      console.error("Missing LLM setting input elements");
      return;
    }
    llmSettings = {
      chatgpt: chatgptUrlInput.value,
      claude: claudeUrlInput.value,
      perplexity: perplexityUrlInput.value,
      grok: grokUrlInput.value,
      defaultLLM: defaultLLMSelect.value
    };
    await chrome.storage.local.set({ llmSettings });
    const modal = document.getElementById('llmSettingsModal');
    if (modal) modal.style.display = 'none';
    showNotification('LLM settings saved successfully!');
  });
}

function showLLMSettingsModal() {
  safeExecute(() => {
    const chatgptUrlInput = document.getElementById('chatgptUrl');
    const claudeUrlInput = document.getElementById('claudeUrl');
    const perplexityUrlInput = document.getElementById('perplexityUrl');
    const grokUrlInput = document.getElementById('grokUrl');
    const defaultLLMSelect = document.getElementById('defaultLLM');
    const modal = document.getElementById('llmSettingsModal');
    if (!chatgptUrlInput || !claudeUrlInput || !perplexityUrlInput || !grokUrlInput || !defaultLLMSelect || !modal) {
      console.error("Required LLM settings modal elements not found");
      return;
    }
    chatgptUrlInput.value = llmSettings.chatgpt;
    claudeUrlInput.value = llmSettings.claude;
    perplexityUrlInput.value = llmSettings.perplexity;
    grokUrlInput.value = llmSettings.grok;
    defaultLLMSelect.value = llmSettings.defaultLLM;
    modal.style.display = 'block';
  });
}

function showPromptLLMModal(promptId) {
  safeExecute(() => {
    currentPromptId = promptId;
    const select = document.getElementById('promptDefaultLLM');
    const modal = document.getElementById('promptLLMModal');
    if (!select || !modal) {
      console.error("Required prompt LLM modal elements not found");
      return;
    }
    select.value = promptLLMPreferences[promptId] || 'global';
    modal.style.display = 'block';
  });
}

async function savePromptLLMPreference() {
  return safeExecute(async () => {
    if (!currentPromptId) return;
    const select = document.getElementById('promptDefaultLLM');
    if (!select) return;
    const llm = select.value;
    if (llm === 'global') {
      delete promptLLMPreferences[currentPromptId];
    } else {
      promptLLMPreferences[currentPromptId] = llm;
    }
    await chrome.storage.local.set({ promptLLMPreferences });
    const modal = document.getElementById('promptLLMModal');
    if (modal) modal.style.display = 'none';
    showNotification('Prompt LLM preference saved!');
  });
}

function getPromptById(promptId) {
  for (const folder of state.folders) {
    const prompt = folder.prompts.find(p => p.id === promptId);
    if (prompt) return prompt;
  }
  return null;
}

function sendToDefaultLLM(promptId) {
  safeExecute(() => {
    const prompt = getPromptById(promptId);
    if (!prompt) return;
    const llm = promptLLMPreferences[promptId] || llmSettings.defaultLLM;
    sendToLLM(promptId, llm);
  });
}

async function sendToLLM(promptId, llmKey) {
  return safeExecute(async () => {
    const prompt = getPromptById(promptId);
    if (!prompt) return;
    const llmUrl = llmSettings[llmKey];
    if (!llmUrl) {
      showNotification('LLM URL not configured', true);
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt.content);
      chrome.tabs.create({ url: llmUrl });
      showNotification(`Prompt copied and opening ${llmKey.charAt(0).toUpperCase() + llmKey.slice(1)}...`);
    } catch (error) {
      console.error('Error sending to LLM:', error);
      showNotification('Error sending prompt to LLM', true);
    }
  });
}