'use strict';
document.addEventListener('DOMContentLoaded', function() { 
    // Get relevant elements and collections
    const tablist = document.querySelector('[role="tablist"]');
    const tabs = tablist.querySelectorAll('button[role="tab"]');
    
    // The tab switching function
    const tabFocus = (oldTab, newTab) => {
      newTab.focus();
    }

    const selectTab = (oldTab, newTab) => {
      // Set the selected state
      newTab.setAttribute('aria-selected', 'true');
      oldTab.removeAttribute('aria-selected');
      // Make the active tab focusable by the user (Tab key)
      newTab.removeAttribute('tabindex');
      oldTab.setAttribute('tabindex', '-1');
    }
    
    // Add semantics are remove user focusability for each tab
    Array.prototype.forEach.call(tabs, (tab, i) => {
      if(tab.getAttribute('aria-selected') !== "true") { tab.setAttribute('tabindex', '-1'); }
      
      // Handle clicking of tabs for mouse users
      tab.addEventListener('click', e => {
        e.preventDefault();
        let currentTab = tablist.querySelector('[aria-selected]');
        if (e.currentTarget !== currentTab) {
          tabFocus(currentTab, e.currentTarget);
          selectTab(currentTab, e.currentTarget);
        }
      });
      
      // Handle keydown events for keyboard users
      tab.addEventListener('keydown', e => {
        // Get the index of the current tab in the tabs node list
        let index = Array.prototype.indexOf.call(tabs, e.currentTarget);
        // Work out which key the user is pressing and
        // Calculate the new tab's index where appropriate
        const first = 0;
        const last = tabs.length - 1;
        let active = document.activeElement;
  
        let dir = (e.which === 37 && active == tabs[first]) ? last : e.which === 37 ? index - 1 : (e.which === 39 && active == tabs[last]) ? first : e.which === 39 ? index + 1 : (e.which === 36 && active == tabs[first]) ? e.preventDefault() : e.which === 36 ? 0 : (e.which === 35 && active == tabs[last]) ? e.preventDefault() : e.which === 35 ? tabs.length - 1 : null;
        if (dir !== null) {
          e.preventDefault();
          // If the down key is pressed, move focus to the open panel,
          // otherwise switch to the adjacent tab
          tabs[dir] ? tabFocus(e.currentTarget, tabs[dir]) : void 0;
        }
      });
    });
});
