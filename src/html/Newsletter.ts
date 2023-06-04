export function createNewsletterCode() {
    return `Swal.fire({
        html: '<input type="text" class="swal2-input" placeholder="Enter your email address">',
        confirmButtonText: 'Subscribe'
    }).then(result => {})`
}
