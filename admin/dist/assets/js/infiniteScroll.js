$(function() {
    // Your custom JavaScript goes here
    /**
     * test for infiniti scrollTop
     * @type {Number}
     */

    var page = 1;
    var path = '/test';

    var news = document.getElementById('News');
    if (news) {
        
        $(window).scroll(function() {
            if (
                $(window).scrollTop() ==
                $(document).height() - $(window).height()
            ) {
                //console.log(++page);
                $.ajax({
                    url: 'http://localhost:4000/api/v1.0/news/getNewsData/' + page,
                    dataType: 'json',
                    error: function(err) {
                        //console.log(err);
                    },
                    success: function(items) {
                        //console.log('jquery: ', items.data);

                        /*
                        <li key={post.id}>
                                            <Link to={`${this.props.match.path}/${post.id}`} >   
                                                <h1>[ {post.category} ]</h1>
                                                <h1>{post.title}</h1>
                                            </Link>
                                            <p>{post.created_at}</p>
                                            <p>{post.subject.substring(0, 120)}</p>
                                        </li>
                        <li>
                            <a href="/test/42">
                                <h1>Voluptatem quae et amet.</h1>
                            </a>
                            <p>2017-08-25T08:01:57.389Z</p>
                            <p>Sapiente cupiditate necessitatibus soluta. In fugit cupiditate quia ut voluptatem. Rerum facilis et. Odit necessitatibus</p>
                        </li>
                        */

                        $.each(items.data, function(key, val) {
                            var newsHtml =
                                "<li key="+val.id+">" +
                                "<a href="+path+"/"+val.id+" >" +
                                "<h1>[ "+val.category+" ]</h1>" +
                                "<h1>"+val.title+"</h1>" +
                                "</a>"+
                                "<p>"+String(val.created_at).replace('T', ' ').replace('Z', '')+"</p>" +
                                "<p>"+String(val.subject).substring(0,120)+"</p>" +
                                "</li>";

                            //console.log(val.category);
                            $('#attachNews').append(newsHtml);
                        });
                    }
                });
            }
        });
    }
});
