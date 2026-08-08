function toggleOptions() {
    var options = document.querySelector(".options");
    if (options.style.display === "none" || options.style.display === "") {
        options.style.display = "flex";
    } else {
        options.style.display = "none";
    }
}

function toggleEditMode() {
    const editableCells = document.querySelectorAll('.editable');
    editableCells.forEach(cell => {
        if (!cell.querySelector('input')) {
            const cellText = cell.textContent;
            cell.innerHTML = `<input type="text" value=${cellText}>`;
        }
    });
}


function submitChanges() {
    const editableCells = document.querySelectorAll('.editable');
    let allValid = true;

    editableCells.forEach(cell => {
        const input = cell.querySelector('input');
        if (input) {
            const newValue = input.value.trim();
            if (newValue === "") {
                input.classList.add("error");
                allValid = false;
            } else {
                input.classList.remove("error");
                cell.innerHTML = newValue;
            }
        }
    });

    if (!allValid) {
        alert("Please fill in all fields.");
        editableCells.forEach(cell => {
            const input = cell.querySelector('input');
            if (input) {
                const newValue = input.value.trim();
                if (newValue === "") {
                    input.classList.add("error");
                }
            }
        });
    }
}
