// Calculator functionality for RamlPoints
document.addEventListener('DOMContentLoaded', function() {
    const programButtons = document.querySelectorAll('.program-btn');
    const pointsInput = document.getElementById('points');
    const calculationResult = document.getElementById('calculation-result');
    const cashValue = document.getElementById('cash-value');
    
    let selectedRate = 0;
    let selectedProgram = '';

    // Program selection
    programButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            programButtons.forEach(btn => btn.classList.remove('border-accent', 'bg-accent/5'));
            
            // Add active class to clicked button
            this.classList.add('border-accent', 'bg-accent/5');
            
            // Get rate and program
            selectedRate = parseFloat(this.dataset.rate);
            selectedProgram = this.dataset.program;
            
            // Calculate if points are entered
            if (pointsInput.value) {
                calculateCash();
            }
        });
    });

    // Points input
    pointsInput.addEventListener('input', function() {
        if (selectedRate > 0 && this.value) {
            calculateCash();
        } else {
            calculationResult.classList.add('hidden');
        }
    });

    function calculateCash() {
        const points = parseFloat(pointsInput.value);
        if (points && selectedRate > 0) {
            // Calculate gross amount
            const grossAmount = points * selectedRate;
            
            // Apply 5% processing fee
            const processingFee = grossAmount * 0.05;
            const netAmount = grossAmount - processingFee;
            
            // Display result
            cashValue.textContent = `${netAmount.toFixed(2)} SAR`;
            calculationResult.classList.remove('hidden');
        }
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
});

