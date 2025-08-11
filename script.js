// API Base URL
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// DOM Elements
const searchSection = document.querySelector('.search-section');
const categoriesSection = document.querySelector('.categories-section');
const areaSection = document.querySelector('.area-section');
const ingredientsSection = document.querySelector('.ingredients-section');
const contactSection = document.querySelector('.contact-section');
const mealsContainer = document.getElementById('mealsContainer');

// Navigation Links
const searchLink = document.querySelector('.search-link');
const categoriesLink = document.querySelector('.categories-link');
const areaLink = document.querySelector('.area-link');
const ingredientsLink = document.querySelector('.ingredients-link');
const contactLink = document.querySelector('.contact-link');

// Search Inputs
const searchByNameInput = document.getElementById('searchByName');
const searchByFirstLetterInput = document.getElementById('searchByFirstLetter');

// Contact Form Elements
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const messageInput = document.getElementById('message');

// Regular Expressions for Form Validation
const nameRegex = /^[a-zA-Z\s]{3,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^01[0125][0-9]{8}$/;
const messageRegex = /^.{10,}$/;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load initial meals
    loadMeals();
    
    // Add event listeners
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Navigation Links
    searchLink.addEventListener('click', () => toggleSection(searchSection));
    categoriesLink.addEventListener('click', () => {
        toggleSection(categoriesSection);
        loadCategories();
    });
    areaLink.addEventListener('click', () => {
        toggleSection(areaSection);
        loadAreas();
    });
    ingredientsLink.addEventListener('click', () => {
        toggleSection(ingredientsSection);
        loadIngredients();
    });
    contactLink.addEventListener('click', () => toggleSection(contactSection));

    // Search Inputs
    searchByNameInput.addEventListener('input', debounce(() => {
        if (searchByNameInput.value) {
            searchMealsByName(searchByNameInput.value);
        }
    }, 500));

    searchByFirstLetterInput.addEventListener('input', debounce(() => {
        if (searchByFirstLetterInput.value) {
            searchMealsByFirstLetter(searchByFirstLetterInput.value);
        }
    }, 500));

    // Contact Form Validation
    [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
        input.addEventListener('input', validateForm);
    });
}

// Toggle Section Visibility
function toggleSection(section) {
    [searchSection, categoriesSection, areaSection, ingredientsSection, contactSection].forEach(s => {
        s.classList.add('d-none');
    });
    section.classList.remove('d-none');
}

// Load Initial Meals
async function loadMeals() {
    try {
        const response = await fetch(`${API_BASE_URL}/search.php?s=`);
        const data = await response.json();
        displayMeals(data.meals.slice(0, 20));
    } catch (error) {
        console.error('Error loading meals:', error);
    }
}

// Load Categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories.php`);
        const data = await response.json();
        displayCategories(data.categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load Areas
async function loadAreas() {
    try {
        const response = await fetch(`${API_BASE_URL}/list.php?a=list`);
        const data = await response.json();
        displayAreas(data.meals);
    } catch (error) {
        console.error('Error loading areas:', error);
    }
}

// Load Ingredients
async function loadIngredients() {
    try {
        const response = await fetch(`${API_BASE_URL}/list.php?i=list`);
        const data = await response.json();
        displayIngredients(data.meals);
    } catch (error) {
        console.error('Error loading ingredients:', error);
    }
}

// Search Meals by Name
async function searchMealsByName(name) {
    try {
        const response = await fetch(`${API_BASE_URL}/search.php?s=${name}`);
        const data = await response.json();
        displayMeals(data.meals ? data.meals.slice(0, 20) : []);
    } catch (error) {
        console.error('Error searching meals by name:', error);
    }
}

// Search Meals by First Letter
async function searchMealsByFirstLetter(letter) {
    try {
        const response = await fetch(`${API_BASE_URL}/search.php?f=${letter}`);
        const data = await response.json();
        displayMeals(data.meals ? data.meals.slice(0, 20) : []);
    } catch (error) {
        console.error('Error searching meals by first letter:', error);
    }
}

// Display Meals
function displayMeals(meals) {
    mealsContainer.innerHTML = '';
    meals.forEach(meal => {
        const mealCard = createMealCard(meal);
        mealsContainer.appendChild(mealCard);
    });
}

// Create Meal Card
function createMealCard(meal) {
    const col = document.createElement('div');
    col.className = 'col-md-4 col-sm-6';
    
    col.innerHTML = `
        <div class="meal-card" data-id="${meal.idMeal}">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="card-body">
                <h5>${meal.strMeal}</h5>
            </div>
        </div>
    `;

    col.querySelector('.meal-card').addEventListener('click', () => {
        showMealDetails(meal.idMeal);
    });

    return col;
}

// Show Meal Details
async function showMealDetails(mealId) {
    try {
        const response = await fetch(`${API_BASE_URL}/lookup.php?i=${mealId}`);
        const data = await response.json();
        const meal = data.meals[0];
        
        const modal = new bootstrap.Modal(document.getElementById('mealDetailsModal'));
        document.getElementById('mealName').textContent = meal.strMeal;
        document.getElementById('mealImage').src = meal.strMealThumb;
        
        const details = document.getElementById('mealDetails');
        details.innerHTML = `
            <h6><strong>Category:</strong> ${meal.strCategory}</h6>
            <h6><strong>Area:</strong> ${meal.strArea}</h6>
            <h6><strong>Instructions:</strong></h6>
            <p>${meal.strInstructions}</p>
            <h6><strong>Ingredients:</strong></h6>
            <ul>
                ${getIngredientsList(meal)}
            </ul>
            ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="btn btn-danger">Watch on YouTube</a>` : ''}
            ${meal.strSource ? `<a href="${meal.strSource}" target="_blank" class="btn btn-primary ms-2">View Source</a>` : ''}
        `;
        
        modal.show();
    } catch (error) {
        console.error('Error loading meal details:', error);
    }
}

// Get Ingredients List
function getIngredientsList(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            ingredients.push(`<li>${measure} ${ingredient}</li>`);
        }
    }
    return ingredients.join('');
}

// Display Categories
function displayCategories(categories) {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = '';
    categories.forEach(category => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6 mb-4';
        col.innerHTML = `
            <div class="card category-card" data-category="${category.strCategory}">
                <img src="${category.strCategoryThumb}" class="card-img-top" alt="${category.strCategory}">
                <div class="card-body">
                    <h5 class="card-title">${category.strCategory}</h5>
                    <p class="card-text">${category.strCategoryDescription}</p>
                </div>
            </div>
        `;
        col.querySelector('.category-card').addEventListener('click', () => {
            searchMealsByCategory(category.strCategory);
        });
        container.appendChild(col);
    });
}

// Display Areas
function displayAreas(areas) {
    const container = document.getElementById('areasContainer');
    container.innerHTML = '';
    areas.forEach(area => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6 mb-4';
        col.innerHTML = `
            <div class="card area-card" data-area="${area.strArea}">
                <div class="card-body">
                    <h5 class="card-title">${area.strArea}</h5>
                </div>
            </div>
        `;
        col.querySelector('.area-card').addEventListener('click', () => {
            searchMealsByArea(area.strArea);
        });
        container.appendChild(col);
    });
}

// Display Ingredients
function displayIngredients(ingredients) {
    const container = document.getElementById('ingredientsContainer');
    container.innerHTML = '';
    ingredients.forEach(ingredient => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6 mb-4';
        col.innerHTML = `
            <div class="card ingredient-card" data-ingredient="${ingredient.strIngredient}">
                <div class="card-body">
                    <h5 class="card-title">${ingredient.strIngredient}</h5>
                </div>
            </div>
        `;
        col.querySelector('.ingredient-card').addEventListener('click', () => {
            searchMealsByIngredient(ingredient.strIngredient);
        });
        container.appendChild(col);
    });
}

// Search Meals by Category
async function searchMealsByCategory(category) {
    try {
        const response = await fetch(`${API_BASE_URL}/filter.php?c=${category}`);
        const data = await response.json();
        displayMeals(data.meals.slice(0, 20));
    } catch (error) {
        console.error('Error searching meals by category:', error);
    }
}

// Search Meals by Area
async function searchMealsByArea(area) {
    try {
        const response = await fetch(`${API_BASE_URL}/filter.php?a=${area}`);
        const data = await response.json();
        displayMeals(data.meals.slice(0, 20));
    } catch (error) {
        console.error('Error searching meals by area:', error);
    }
}

// Search Meals by Ingredient
async function searchMealsByIngredient(ingredient) {
    try {
        const response = await fetch(`${API_BASE_URL}/filter.php?i=${ingredient}`);
        const data = await response.json();
        displayMeals(data.meals.slice(0, 20));
    } catch (error) {
        console.error('Error searching meals by ingredient:', error);
    }
}

// Form Validation
function validateForm() {
    const isNameValid = nameRegex.test(nameInput.value);
    const isEmailValid = emailRegex.test(emailInput.value);
    const isPhoneValid = phoneRegex.test(phoneInput.value);
    const isMessageValid = messageRegex.test(messageInput.value);

    submitBtn.disabled = !(isNameValid && isEmailValid && isPhoneValid && isMessageValid);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 