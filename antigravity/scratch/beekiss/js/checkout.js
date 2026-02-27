/**
 * checkout.js - Bee Kiss E-Commerce Checkout Logic
 * Handles cart rendering, totals, and mock payment flow on checkout page.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // DOM Elements
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutEmptyMsg = document.getElementById('checkout-empty-msg');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutTotal = document.getElementById('checkout-total');
    const btnPayNow = document.getElementById('btn-pay-now');
    const checkoutForm = document.getElementById('checkout-form');

    // Load Cart from LocalStorage
    let cart = [];
    const savedCart = localStorage.getItem('beekiss_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }

    // Fixed Shipping cost for premium feel
    const shippingCost = cart.length > 0 ? 99 : 0;

    // Render Cart Items
    function renderCheckout() {
        if (cart.length === 0) {
            checkoutItemsContainer.innerHTML = '';
            checkoutEmptyMsg.style.display = 'block';
            checkoutEmptyMsg.textContent = 'Your cart is empty. Please add items to checkout.';
            btnPayNow.style.opacity = '0.5';
            btnPayNow.style.pointerEvents = 'none';
            btnPayNow.textContent = 'Cart Empty';

            checkoutSubtotal.textContent = '₹ 0';
            checkoutTotal.textContent = '₹ 0';

            return;
        }

        checkoutEmptyMsg.style.display = 'none';
        checkoutItemsContainer.innerHTML = '';

        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'summary-item';
            itemEl.innerHTML = `
                <div>
                    <strong>${item.name}</strong> 
                    <span class="text-muted" style="font-size: 0.8rem;">(${item.variant})</span>
                    x ${item.quantity}
                </div>
                <div>₹ ${itemTotal}</div>
            `;

            checkoutItemsContainer.appendChild(itemEl);
        });

        // Update Totals
        const grandTotal = subtotal + shippingCost;
        checkoutSubtotal.textContent = `₹ ${subtotal}`;

        // Add Shipping Row manually since we fixed it
        const shippingRow = document.createElement('div');
        shippingRow.className = 'summary-item';
        shippingRow.innerHTML = `
            <div>Standard Shipping</div>
            <div>₹ ${shippingCost}</div>
        `;
        checkoutItemsContainer.appendChild(shippingRow);

        checkoutTotal.textContent = `₹ ${grandTotal}`;
        btnPayNow.textContent = `Pay ₹ ${grandTotal} Securely`;
    }

    renderCheckout();

    // Mock Payment Flow
    btnPayNow.addEventListener('click', (e) => {
        e.preventDefault();

        // Basic validation
        if (!checkoutForm.checkValidity()) {
            checkoutForm.reportValidity();
            return;
        }

        // Animate button
        const originalText = btnPayNow.textContent;
        btnPayNow.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        btnPayNow.style.pointerEvents = 'none';

        // Mock Razorpay delay
        setTimeout(() => {
            // Clear Cart
            localStorage.removeItem('beekiss_cart');

            // Show Success Message replacing form
            const checkoutSection = document.querySelector('.checkout-grid');

            checkoutSection.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: white; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    <div style="width: 80px; height: 80px; background-color: var(--color-honey-gold); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem;">
                        <i class="fa-solid fa-check" style="font-size: 2.5rem; color: var(--color-forest-dark);"></i>
                    </div>
                    <h2 style="color: var(--color-forest-dark); margin-bottom: 1rem; font-family: var(--font-heading);">Payment Successful</h2>
                    <p style="font-size: 1.1rem; color: var(--color-text-muted); margin-bottom: 2rem;">Thank you for your premium order. Your pure Wayanad forest honey is being prepared.</p>
                    <p style="margin-bottom: 2rem;"><strong>Order ID:</strong> BK-${Math.floor(100000 + Math.random() * 900000)}</p>
                    <a href="index.html" class="btn btn-primary">Return to Store</a>
                </div>
            `;

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

        }, 1500);
    });
});
