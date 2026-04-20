// AI Guardian Content Script
console.log("AI Guardian: Content script injected.");

const processedTexts = new Set();

// Function to scan text and send for analysis
async function scanText(text, element) {
  if (!text || text.length < 5 || processedTexts.has(text)) return;
  processedTexts.add(text);

  chrome.runtime.sendMessage({ type: "ANALYZE_TEXT", text: text }, (response) => {
    if (response && response.status === "success") {
      const data = response.data;
      if (data.risk_level === "High" || data.risk_level === "Medium") {
        showAlert(element, data);
      }
    }
  });
}

// Function to show visual alert on the page
function showAlert(element, data) {
  const overlay = document.createElement("div");
  overlay.className = "ai-guardian-alert";
  overlay.innerHTML = `
    <div class="ai-guardian-header">
      <span class="ai-guardian-icon">🛡️</span>
      AI GUARDIAN ALERT
    </div>
    <div class="ai-guardian-body">
      <strong>${data.category} detected!</strong><br>
      ${data.alert}
    </div>
    <div class="ai-guardian-footer">
      Risk Level: <span class="risk-${data.risk_level.toLowerCase()}">${data.risk_level}</span>
    </div>
  `;
  
  // Position near the suspicious element
  const rect = element.getBoundingClientRect();
  overlay.style.top = `${window.scrollY + rect.top - 10}px`;
  overlay.style.left = `${window.scrollX + rect.left}px`;
  
  document.body.appendChild(overlay);
  
  // Auto-remove after 10 seconds
  setTimeout(() => overlay.remove(), 10000);
}

// Monitor for specific chat platforms and general text
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // WhatsApp Web message selector
        if (node.classList.contains('message-in')) {
          const textElement = node.querySelector('.copyable-text span');
          if (textElement) scanText(textElement.textContent, node);
        }
        
        // General text observation
        if (node.textContent && node.textContent.length > 20) {
          // Check for input fields or common chat containers
          if (node.tagName === 'DIV' || node.tagName === 'SPAN') {
            scanText(node.textContent, node);
          }
        }
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });

// Scan existing content on load
document.querySelectorAll('div, span, p').forEach(el => {
  if (el.textContent && el.textContent.length > 20) {
     // Limit initial scan to reduce overhead
     if (Math.random() > 0.9) scanText(el.textContent, el);
  }
});
