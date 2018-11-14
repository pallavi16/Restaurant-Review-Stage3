if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
  .then(() => {

    console.log('Service Worker Registration success!!.');
   
  }).catch(error => {
  
    console.log('Sorry! Registration Failed:  with error ' + error);
  });
}


