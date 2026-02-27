/**
 * app.js - Bee Kiss E-Commerce Frontend Logic
 * Handles animations, cart functionality, and UI interactions.
 */

// Define Cart State
let cart = [];

// DOM Elements
const cartToggleBtn = document.getElementById('cart-toggle');
const closeCartBtn = document.getElementById('close-cart');
const cartOverlay = document.getElementById('cart-overlay');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items-container');
const emptyCartMsg = document.getElementById('empty-cart-msg');
const cartTotalAmount = document.getElementById('cart-total-amount');
const cartCounter = document.getElementById('cart-counter');
const checkoutBtn = document.getElementById('checkout-btn');

const mainHeader = document.getElementById('main-header');
const weightOptions = document.querySelectorAll('.weight-option');
const addToCartBtns = document.querySelectorAll('.btn-add-cart');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load cart from LocalStorage
    loadCart();
    
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Intersection Observer for scroll animations (fade-up and fade-in)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up, .fade-in').forEach(element => {
        animateOnScroll.observe(element);
    });

    // Sticky Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });

    // Product Weight Selection Logic
    weightOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const btn = e.target;
            const productType = btn.closest('.product-weights').dataset.product;
            const newPrice = btn.dataset.price;
            
            // Remove active class from siblings
            btn.closest('.product-weights').querySelectorAll('.weight-option').forEach(sibling => {
                sibling.classList.remove('active');
            });
            
            // Add active class to clicked
            btn.classList.add('active');
            
            // Update UI Price Display
            document.getElementById(`price-${productType}`).textContent = `₹ ${newPrice}`;
            
            // Note: Add to cart button implicitly reads the `.active` sibling when clicked.
        });
    });

    // Add To Cart Event Listeners
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = btn.dataset.id;
            const productName = btn.dataset.name;
            const productType = btn.dataset.type;
            
            // Find active weight option
            const activeWeightBtn = document.querySelector(`.product-weights[data-product="${productType}"] .weight-option.active`);
            const variantWeight = activeWeightBtn.dataset.weight;
            const variantPrice = parseInt(activeWeightBtn.dataset.price, 10);
            
            // Find Product Image Source
            const imageSrc = btn.closest('.product-card').querySelector('img').src;
            
            addToCart({
                id: productId,
                name: productName,
                variant: variantWeight,
                price: variantPrice,
                image: imageSrc,
                quantity: 1
            });
            
            // Open Cart Sidebar automatically
            openCart();
        });
    });

    // Cart UI Toggles
    cartToggleBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
});

// Cart Core Functions
function loadCart() {
    const savedCart = localStorage.getItem('beekiss_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('beekiss_cart', JSON.stringify(cart));
}

function addToCart(newItem) {
    // Generate a unique ID based on product ID + variant
    const cartItemId = `${newItem.id}-${newItem.variant}`;
    
    // Check if item already exists
    const existingItemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
    
    if (existingItemIndex > -1) {
        // Increment quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        cart.push({ ...newItem, cartItemId });
    }
    
    saveCart();
    updateCartUI();
    
    // Tiny subtle animation on cart icon
    cartToggleBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartToggleBtn.style.transform = 'scale(1)';
    }, 200);
}

function removeFromCart(cartItemId) {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    saveCart();
    updateCartUI();
}

function updateQuantity(cartItemId, delta) {
    const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
    
    if (itemIndex > -1) {
        cart[itemIndex].quantity += delta;
        if (cart[itemIndex].quantity <= 0) {
            removeFromCart(cartItemId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

// Cart UI Functions
function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function updateCartUI() {
    // Calculate totals
    let totalItems = 0;
    let totalPrice = 0;
    
    // Clear Container
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        emptyCartMsg.style.display = 'block';
        checkoutBtn.style.pointerEvents = 'none';
        checkoutBtn.style.opacity = '0.5';
    } else {
        emptyCartMsg.style.display = 'none';
        checkoutBtn.style.pointerEvents = 'auto';
        checkoutBtn.style.opacity = '1';
        
        cart.forEach(item => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-variant">${item.variant}</div>
                    <div class="cart-item-price">₹ ${item.price}</div>
                    
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateQuantity('${item.cartItemId}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity('${item.cartItemId}', 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.cartItemId}')">Remove</button>
            `;
            
            cartItemsContainer.appendChild(itemElement);
        });
    }
    
    // Update labels
    cartCounter.textContent = totalItems;
    cartTotalAmount.textContent = `₹ ${totalPrice}`;
}

// Global functions for inline HTML event handlers
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
