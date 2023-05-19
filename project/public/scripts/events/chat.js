const socket = io('http://localhost:4000', { transports: ['websocket', 'polling', 'flashsocket']});

        socket.on("connect", () => {
            console.log("Connected to server");
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from server");
            socket.connect()
        });

        // listen for new message events

        socket.on("new message", () => {
            location.reload()

        });

        // send message to server
        const sendMessage = () => {
            const content = document.getElementById("input-message").value;
            socket.emit("create message", { content });
        };
window.onload = function() {
 window.scrollTo(0, document.body.scrollHeight);

}