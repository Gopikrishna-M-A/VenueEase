function deleteReservation(reservationId) {
    console.log(reservationId);
    
    const confirmCancel = window.confirm('Are you sure you want to cancel the reservation?');
    
    if (confirmCancel) {
      fetch('/cancelReservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId }),
      })
      .then(response => {
        // Handle the response from the server
        // ...
      })
      .catch(error => {
        // Handle any errors that occurred during the request
        // ...
      });
    }
  }
  