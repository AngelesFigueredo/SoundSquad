const socket = io('http://localhost:4000', { transports: ['websocket', 'polling', 'flashsocket']});

        socket.on("connect", () => {
            console.log("Connected to server");
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from server");
            socket.connect()
        });

        // listen for new message events
        socket.on("new message", (message) => {
            const messageDiv = document.createElement("div");
            //messageDiv.innerHTML = `
            //    <div class="card" style="width: 100%;">
            //    <div class="card-body">
            //        <h5 class="card-title">
            //        ${message.author._id == "{{session.currentUser._id}}" ? "You" : message.author}
            //        </h5>
            //        <h6 class="card-subtitle mb-2 text-muted">${message.createdAt}</h6>
            //        <p class="card-text">${message.content}</p>
            //    </div>
            //    </div>
            //`;
            messageDiv.innerHTML = `
                <div class="card" style="width: 100%;">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">${message.createdAt}</h6>
                    <p class="card-text">${message.content}</p>
                </div>
                </div>
            `;
            document.getElementById("event-messages").appendChild(messageDiv);
        });

        // send message to server
        const sendMessage = () => {
            const content = document.getElementById("input-message").value;
            socket.emit("create message", { content });
        };
