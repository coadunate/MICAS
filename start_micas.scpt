tell application "iTerm"
    activate
    
    -- create a new window
    tell application "System Events" to keystroke "n" using command down
    delay 1
    
    -- split the window vertically
    tell application "System Events" to keystroke "d" using command down
    delay 1
    
    -- go to the first part of the split
    tell application "System Events" to keystroke "[" using command down
    delay 1
    
    -- START UP REDIS & CELERY
    tell current session of current window
        write text "cd ~/Documents/MICAS/server/app/main/utils"
        delay 1
        write text "conda activate micas"
        delay 1
        write text "redis-server &"
        delay 1
        write text "celery -A tasks worker --loglevel=INFO"
        delay 1
    end tell
    
    -- create a horizontal split
    tell application "System Events" to keystroke "D" using command down
    delay 1
    
    -- START UP FLASK BACKEND
    tell current session of current window
        write text "cd ~/Documents/MICAS"
        delay 1
            write text "conda activate micas"
        delay 1
        write text "python server/micas.py"
    end tell
    
    -- go to the right split
    tell application "System Events" to keystroke "]" using command down
    delay 1
    
    -- START UP FLASK BACKEND
    tell current session of current window
        write text "cd ~/Documents/MICAS"
        delay 1
    end tell
    
    -- create a horizontal split
    tell application "System Events" to keystroke "D" using command down
    delay 1
    
    -- START UP FRONT END
    tell current session of current window
        write text "cd ~/Documents/MICAS/frontend"
        delay 1
        write text "npm install"
        delay 1
        write text "npm run start"
        delay 1
    end tell
    
end tell
