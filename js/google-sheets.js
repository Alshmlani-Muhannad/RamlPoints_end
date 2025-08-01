// Google Sheets Integration for RamlPoints
// Handles form submission to Google Sheets via Google Apps Script

class GoogleSheetsIntegration {
    constructor() {
        this.webhookUrl = 'https://script.google.com/macros/s/AKfycbxcaSteNxjh3OnvcrOOc3EcM82V03JaqebsiYBDq3t2AKHQehH_pHIxdVbs9Rh-Pk7B/exec';
        this.isSubmitting = false;
    }

    // Simple encryption function (basic obfuscation)
    encryptData(data) {
        try {
            const encoded = btoa(JSON.stringify(data));
            return encoded.split('').reverse().join('');
        } catch (error) {
            console.warn('Encryption failed, using plain data:', error);
            return data;
        }
    }

    // Decrypt function
    decryptData(encryptedData) {
        try {
            const reversed = encryptedData.split('').reverse().join('');
            return JSON.parse(atob(reversed));
        } catch (error) {
            console.warn('Decryption failed:', error);
            return encryptedData;
        }
    }

    // Validate form data
    validateFormData(data) {
        const errors = [];

        if (!data.PhoneNumber || data.PhoneNumber.length < 10) {
            errors.push('Valid phone number is required');
        }

        if (!data.ProgramName || data.ProgramName.trim() === '') {
            errors.push('Program name is required');
        }

        if (!data.PointsNumber || data.PointsNumber < 1000) {
            errors.push('Minimum 1000 points required');
        }

        if (!data.BankName || data.BankName.trim() === '') {
            errors.push('Bank name is required');
        }

        if (!data.IBAN || data.IBAN.length < 15) {
            errors.push('Valid IBAN is required');
        }

        return errors;
    }

    // Format phone number
    formatPhoneNumber(phone) {
        // Remove all non-digits
        let cleaned = phone.replace(/\D/g, '');
        
        // Add +966 if not present
        if (!cleaned.startsWith('966')) {
            if (cleaned.startsWith('0')) {
                cleaned = '966' + cleaned.substring(1);
            } else if (cleaned.startsWith('5')) {
                cleaned = '966' + cleaned;
            }
        }
        
        return '+' + cleaned;
    }

    // Submit data to Google Sheets
    async submitToGoogleSheets(formData) {
        if (this.isSubmitting) {
            throw new Error('Submission already in progress');
        }

        this.isSubmitting = true;

        try {
            // Prepare data according to Google Sheets columns
            const data = {
                PhoneNumber: this.formatPhoneNumber(formData.phone),
                ProgramName: formData.programName,
                PointsNumber: parseInt(formData.pointsBalance),
                BankName: formData.bankName,
                IBAN: formData.iban.toUpperCase()
            };

            // Validate data
            const validationErrors = this.validateFormData(data);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join(', '));
            }

            // Encrypt sensitive data
            const encryptedData = this.encryptData(data);

            // Submit to Google Sheets
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(encryptedData),
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseText = await response.text();
            
            if (responseText.includes('Success') || response.status === 200) {
                return {
                    success: true,
                    message: 'Request submitted successfully! We will contact you within 24 hours.',
                    data: data
                };
            } else {
                throw new Error('Unexpected response from server');
            }

        } catch (error) {
            console.error('Google Sheets submission error:', error);
            
            // Return user-friendly error message
            let errorMessage = 'Failed to submit request. ';
            
            if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage += 'Please check your internet connection and try again.';
            } else if (error.message.includes('validation')) {
                errorMessage += error.message;
            } else {
                errorMessage += 'Please try again or contact support via WhatsApp.';
            }

            return {
                success: false,
                message: errorMessage,
                error: error.message
            };
        } finally {
            this.isSubmitting = false;
        }
    }

    // Show loading state
    showLoadingState(button) {
        if (button) {
            button.disabled = true;
            button.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
            `;
        }
    }

    // Reset button state
    resetButtonState(button, originalText = 'Submit Request') {
        if (button) {
            button.disabled = false;
            button.innerHTML = originalText + `
                <svg class="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
            `;
        }
    }

    // Show success message
    showSuccessMessage(container, message) {
        if (container) {
            container.innerHTML = `
                <div class="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-success font-medium">${message}</span>
                    </div>
                </div>
            `;
        }
    }

    // Show error message
    showErrorMessage(container, message) {
        if (container) {
            container.innerHTML = `
                <div class="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-error mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-error font-medium">${message}</span>
                    </div>
                </div>
            `;
        }
    }
}

// Export for use in other files
window.GoogleSheetsIntegration = GoogleSheetsIntegration;

