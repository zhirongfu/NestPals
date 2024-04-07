import LoginButton from "./components/login";
import LogoutButton from "./components/logout";
import {useEffect} from 'react'
import { gapi } from 'gapi-script';
import Login from "./components/login";

const clientId = "630038648737-et0vimlmiicfif7gshrk4cnthh162j58.apps.googleusercontent.com";

function App() {

    useEffect(() => {
        function start() {
            gapi.clientId.init({
                clientId: clientId,
                scope: ""
            })
        };

        gapi.load('client:auth2', start);
    });

    return (
        <div className="App">
            <LoginButton />
            <LogoutButton />
        </div>
    )    
}

export default App;