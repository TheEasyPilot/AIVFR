// The data array
const items = ['Apple', 'Banana', 'Cherry', 'Date'];

// Get the container element from your HTML document
const container = document.getElementById('list-container');

// Loop through the array and create elements
items.forEach(itemText => {
  // Create a new div element for each item
  const itemElement = document.createElement('div');
  
  // Set the text content
  itemElement.textContent = itemText;
  
  // Optional: add a CSS class for styling (e.g., hover effects)
  itemElement.classList.add('list-item'); 
  
  // Append the newly created element to the container in the DOM
  container.appendChild(itemElement);
});

// Attach one click listener to the parent container
container.addEventListener('click', function(event) {
  // Check if the clicked element has the 'list-item' class
  if (event.target && event.target.classList.contains('list-item')) {
    // This is the function that runs when an item is clicked
    const clickedItemText = event.target.textContent;
    alert(`You clicked on: ${clickedItemText}`);
    
    // You can add more complex logic here, 
    // e.g., redirecting the user or changing the item's appearance.
  }
});
