# use NodeBB

    persona 테마를 수정 해야 한다.

#forum

    # nodebb forum  
        1. install nodebb 1.7.x
            - adminRujjang / admin@gmail.com / car 

        2. install pulgin  
            nodebb-plugin-session-sharing  
                - setting in admin
                    base name :
                    cookie name : connect.sid-f
                    cookie domain :
                    JWT : same the backend
                - session handle
                    trust -> revalidate
                    turn on "automaticalyy update..."

            nodebb-plugun-recent-card

            //nodebb-plugin-composer-redactor  
            //nodebb-plugin-important  
            //nodebb-plugin-question-and-answer  
            //nodebb-plugin-header-extend

    # apply backup plugin 
        - session-shar (api/setting, api/edit call 막기)
            npm install node-regexp --save
        - youngtip  -- not use

    # balance 연동
        nodebb의 user 테이블 signature컬럼을 balance값으로 이용
        nodebb의 src/middleware/header.js의 90라인에 signature 추가
        nodebb의 src/middleware/header.js의 124라인에 request 로직 추가
        nodebb의 config.json의 request용 api url 수정
        nodebb의 /NodeBB/node_modules/nodebb-theme-persona/templates/partials/menu.tpl의 balance부분에 {user.signature} 추가

    # html user menu에 setting, edit 제거
        /Users/leeyoungsoon/my_task/my_bolierplate/NodeBB/node_modules/nodebb-theme-persona/templates/partials/accpunt/menu.tpl 의 user setting, edit 제거

    # change header and menu
        1. /NodeBB/node_modules/nodebb-theme-persona/templates/partials/menu.tpl 수정
        2. /NodeBB/node_modules/nodebb-theme-persona/templates/header.tpl 수정(css추가)

    !!!
    admin too settings
        1. settings > general : turn off [Show Site Title Header]
        2. settings > user > Authentication: turn off [Allow local login] 맨 나중에 막기 !!!!
        3. settings > user > Account Settings,Themes  (기본값과 반대로...)
        4. settings > user > User Registration: No Registration
        5. settings > grop > General: turn off [private groups]
        6. settings > post > Post Sorting [Newst to older]
        7. settings > post > all turn off [Signature Settings]
        8. setting > post > turn on [IP tracking]
        9. setting > chat > turn off chat

    * admin login
        http://localhost:4567/login?local=1