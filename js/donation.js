/*
 * donation page extra js, nice one-time/recur switcher
 *   
 */

/*jslint indent: 2 */
/*global CRM, ts */

CRM.$(function ($) {
  'use strict';
  const recurSettings = (typeof CRM.contributionrecur == 'undefined') ? CRM.vars.contributionrecur : CRM.contributionrecur;
  const form = document.querySelector('.crm-container form');
  const priceSections = form.querySelectorAll(recurSettings.one_time_gift_section, recurSettings.monthly_gift_section);

  // Initiate price sections with other amount sections hidden, unless a default "other" option is selected. Give sections an ID. Give other amount inputs a helpful description.
  (function initiateSections() {
      priceSections.forEach(function(section) {
        const otherAmtSection = section.querySelector(`${recurSettings.other_one_time_amount_section}`) || section.querySelector(`${recurSettings.other_amount_section}`) || section.nextElementSibling;
        const selectedOption = section.querySelector('input[type="radio"]:checked');
        const desc = otherAmtSection.querySelector('.description');
        const input = otherAmtSection.querySelector('input');

        // get the section's unique class and make it the section ID to associate errors with later (why can't Civi do this...
        const uniqueClass = [...section.classList].filter((item) => item.includes('-id-'));
        
        section.id = uniqueClass;

        // give other amount inputs some help text to try to prevent errors
        if(desc) {
            desc.id = `${input.id}--desc`;
        } else {
            input.insertAdjacentHTML('afterend',
            `<span class="description" id="${input.id}--desc">
                ${ts("Please enter numbers only, no periods, spaces, letters or other characters.")}
            </span>
            `);
        }

        //check if the active tab has a zero amount selected; if so, show the "other amount" input, else hide it
        if(selectedOption && parseFloat(selectedOption.getAttribute('data-amount')) === 0) {
          if(section.classList.contains('price-section--active')) {
            requireOtherAmt(otherAmtSection);
          }
        } else {
          hideOtherAmt(otherAmtSection);
        }
      });
  })();

  // Create the tabpanel & put all form elements inside it except for messages & intro text. Create & insert tabs
  (function createTabs() {
      const nodes = form.querySelectorAll('.crm-block > *:not(.messages):not(.intro_text-section)');
      const tabpanel = document.createElement('div');
      tabpanel.setAttribute('role', 'tabpanel');
      tabpanel.classList.add('form-elements-wrapper');
  
      // Cache the current parent and previous sibling of the first node.
      var parent = nodes[0].parentNode;
      var previousSibling = nodes[0].previousSibling;
  
      // Place each node in wrapper.
      //  - If nodes is an array, we must increment the index we grab from 
      //    after each loop.
      //  - If nodes is a NodeList, each node is automatically removed from 
      //    the NodeList when it is removed from its parent with appendChild.
      for (var i = 0; nodes.length - i; tabpanel.firstChild === nodes[0] && i++) {
        tabpanel.appendChild(nodes[i]);
      }
  
      // Place the wrapper just after the cached previousSibling,
      // or if that is null, just before the first child.
      var nextSibling = previousSibling ? previousSibling.nextSibling : parent.firstChild;
      parent.insertBefore(tabpanel, nextSibling);
  
      tabpanel.insertAdjacentHTML('beforebegin', 
        `<div role="tablist" class="gift-type-select" aria-label="${ts("Donation form")}">
          <button id="one-time-gift" type="button" role="tab" data-controls="${recurSettings.one_time_gift_section.id}" tabindex="-1" aria-selected="true">${ts("One-time Gift")}</button>
          <button id="monthly-gift" type="button" role="tab" data-controls="${recurSettings.monthly_gift_section.id}" tabindex="-1">${ts("Monthly Gift")}</button>
        </div>`);
    })();

  const tablist = form.querySelector('[role="tablist"]');
  const tabs = tablist.querySelectorAll('[role="tab"]');

  // Function for showing/hiding relevant sections
  function showHideSections(selectedTab) {
      const target = selectedTab.getAttribute("data-controls");
      const activeSection = form.querySelector(`#${target}`);
      const inactiveTab = tablist.querySelector(`[role="tab"]:not([data-controls="${target}"])`);
      const inactiveSection = form.querySelector(`.${inactiveTab.getAttribute("data-controls")}`);

      activeSection.classList.add('price-section--active');
      activeSection.classList.remove('price-section--inactive');
      activeSection.removeAttribute('hidden');

      inactiveSection.setAttribute('hidden', '');
      inactiveSection.classList.remove('price-section--active');
      inactiveSection.classList.add('price-section--inactive');
  }

  // Initiate tabs with inactive section hidden
  showHideSections(tablist.querySelector('[role="tab"][aria-selected="true"]'));

  // Function for hiding other amount section
  function hideOtherAmt(otherAmtSection) {
      if(otherAmtSection.getAttribute('hidden') == null) {
        otherAmtSection.setAttribute('hidden', '');
        const input = otherAmtSection.querySelector('input[type="text"]');
        const error = form.querySelector(`#${input.id}--error`);
  
        input.value ? input.value = "" : null;
  
        input.setAttribute('aria-required', 'false');
        input.getAttribute('aria-invalid') == "true" ? input.setAttribute('aria-invalid', 'false') : null;
  
        error ? error.remove() : null;
      }
  }

  // Function for showing other amount section
  function showOtherAmt(otherAmtSection) {
      otherAmtSection.removeAttribute('hidden', '');
  }

  // Make other amount input required when its corresponding radio button is selected
  function requireOtherAmt(otherAmtSection) {
      const input = otherAmtSection.querySelector('input[type="text"]');
      const label = otherAmtSection.querySelector('label');
  
      input.setAttribute('aria-required', 'true');
  
      label.innerText.includes('*') ? null : label.insertAdjacentHTML('beforeend', `<span class="crm-marker">*</span>`);
  }

  // Show/hide recurring option and make recur checkbox uneditable based on which tab is active.
  function recur(activeSection) {
      const recurSection = form.querySelector('.is_recur-section');
      const checkbox = recurSection.querySelector('input[type="checkbox"]');

      if(activeSection === recurSettings.monthly_gift_section) {
      checkbox.checked = true;
      checkbox.setAttribute('aria-disabled', true);
      recurSection.removeAttribute('hidden');
      } else {
      recurSection.setAttribute('hidden', '');
      }

      checkbox.addEventListener('change', function() {
      !checkbox.checked ? checkbox.checked = true : null;
      });
  }

  recur(form.querySelector('.price-section--active'));

  // Show/hide other amount section and/or section error based on selected option
  priceSections.forEach(function(section) {
      const options = section.querySelectorAll('input[type="radio"]');
      const otherAmtSection = section.querySelector(`${recurSettings.other_one_time_amount_section}`) || section.querySelector(`${recurSettings.other_amount_section}`) || section.nextElementSibling;

      options.forEach(function(option) {
          option.addEventListener('change', function(e) {
              const amt = parseFloat(e.target.getAttribute('data-amount'));
              const error = section.querySelector(`#${section.id}--error`);

              if(amt === 0) {
              showOtherAmt(otherAmtSection);
              requireOtherAmt(otherAmtSection);
              } else {
              hideOtherAmt(otherAmtSection);
              }

              if(error) {
              error.remove();
              }
          });
      });
  });

  // When tabs are clicked, show/hide the relevant sections, unselect or clear any inputs & errors in inactive section, hide inactive section other amount, show or hide recurring checkbox
  tabs.forEach(function(tab) {
      tab.addEventListener('click', function(e) {
      showHideSections(e.target);

      const inactiveSection = form.querySelector('.price-section--inactive');
      const options = inactiveSection.querySelectorAll('input[type="radio"], input[type="checkbox"]');
      const inactiveOther = inactiveSection.querySelector(`${recurSettings.other_one_time_amount_section}`) || inactiveSection.querySelector(`${recurSettings.other_amount_section}`) || inactiveSection.nextElementSibling;

      options.forEach(function(option) {
          option.checked ? option.checked = false : null;
      });

      hideOtherAmt(inactiveOther);

      recur(form.querySelector('.price-section--active'));

      });
  });

  // No donate amount options selected, create an error
  function createAmountError() {
      const activeSection = form.querySelector('.price-section--active');
      const id = activeSection.id;
      const label = activeSection.querySelector('legend') || activeSection.querySelector('div.label');
      const options = activeSection.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked');
  
      if(options.length == 0) {
        const sectionError = form.querySelector(`#${id}--error`) ? null : document.createElement('p');
        sectionError.id = `${id}--error`;
        activeSection.setAttribute('aria-describedby', sectionError.id);
        sectionError.setAttribute('tabindex', '-1');
        sectionError.classList.add('crm-inline-error', 'section-error');
        sectionError.innerText = `${ts("Please select an amount.")}`;
  
        label ? label.insertAdjacentElement('afterend', sectionError) : activeSection.insertAdjacentElement('afterbegin', sectionError);
  
        sectionError.focus();
      }
  }

  // Other amount option selected but no other amount entered, or input is not a number? Create an error.
  function createOtherError() {
      const activeSection = form.querySelector('.price-section--active');
      const otherAmt = activeSection.querySelector(`${recurSettings.other_one_time_amount_section}`) || activeSection.querySelector(`${recurSettings.other_amount_section}`) || activeSection.nextElementSibling;
      const label = otherAmt.querySelector('label');
      const input = otherAmt.querySelector('input');
      const id = input.id;
  
      const required = input.getAttribute('aria-required');
      const described = input.getAttribute('aria-describedby');
  
      if(required == "true" && (!input.value || (input.value && isNaN(input.value)))) {
        const error = document.querySelector(`#${id}--error`) || document.createElement('div');
        error.id = `${id}--error`;
        error.classList.add('crm-error', 'crm-inline-error', 'other-amount--error');
        input.insertAdjacentElement('afterend', error);
  
        if(!input.value) {
          error.textContent = `${label.textContent.replace('*', '')}  ${ts("is required")}`;
        } else if(input.value && isNaN(input.value)) {
          error.textContent = `${ts("Amount must be numbers only")}`;
        }
        
        described && !described.includes(`${id}--error`) ? input.setAttribute('aria-describedby', `${described} ${id}--error`) : null;
        
        input.setAttribute('aria-invalid', 'true');
        input.classList.add('crm-inline-error');
  
        otherAmt.addEventListener('input', function() {
          const error = form.querySelector(`#${input.id}--error`);
      
          if(error) {
            if(input.value && !isNaN(input.value)) {
              error.remove();
              input.setAttribute('aria-invalid', 'false');
              input.classList.remove('crm-inline-error');
            }
          }
        });
      }
  };

  // Create donation amount and/or other amount errors as needed on form submit, both submit button click and "enter" press in form
  const submit = form.querySelector('button[type="submit"]');

  submit.addEventListener('click', function() {
      createAmountError();
      createOtherError();
  });

  form.addEventListener('keydown', function(e) {
      if(e.which === 13) {
      createAmountError();
      createOtherError();
      }
  });
});