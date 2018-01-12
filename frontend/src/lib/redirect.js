
export default (function() {
    const forumUrl = 'http://localhost:4567/';
    return {
      set: (history, lastLocation) => {
          //console.log('redirect: ', document.referrer);
          //console.log('redirect: ', lastLocation);

        if( (document.referrer !== '' ) && (document.referrer === forumUrl) ){
            history.push('/');
        }else{
            if(!lastLocation){
                history.push('/');
            }else{
                if( 
                    (lastLocation != null) &&
                    (lastLocation !== 'undefiend') &&
                    (String(lastLocation.pathname).search('reset_password') >= 0) ||
                    (String(lastLocation.pathname).search('email_confirm') >= 0) || 
                    (String(lastLocation.pathname).search('unemail_confirm') >= 0) || 
                    (String(lastLocation.pathname).search('forgot_password') >= 0) ||
                    (String(lastLocation.pathname).search('login') >= 0) || 
                    (String(lastLocation.pathname).search('profile') >= 0) 
                    )
                {
                    //console.log('previous url; ', lastLocation.pathname);
                    history.push('/');
                }else{
                    history.goBack();
                }
            }
        }
      }
    }
  })();
