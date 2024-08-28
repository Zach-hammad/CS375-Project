let input = document.getElementById("datum");
let button = document.getElementById("submit");
let div = document.getElementById("data");

function populate() {
    div.textContent = "";
    fetch("/data")
        .then((response) => response.json())
        .then((body) => {
            let data = body.data;
            if (data.length === 0) {
                div.textContent = "No data yet";
            } else {
                for (let obj of data) {
                    let datumDiv = document.createElement("div");
                    datumDiv.textContent = obj.datum;
                    div.append(datumDiv);
                }
            }
        });
}

button.addEventListener("click", () => {
    fetch("/datum", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ datum: input.value }),
    })
        .then((response) => {
            return response.json();
        })
        .then((body) => {
            populate();
        })
        .catch((error) => {
            console.log(error);
        });
});

populate();