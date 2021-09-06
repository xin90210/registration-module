if (!localStorage.jwt) {
    location.href = "/"
}

const userList = document.getElementById('user-list')

showUsers()

function buildUserItem(user) {
    return `
        <li>Name: ${user.name}<br> Login: ${user.login}</li>
    `
}


function showUsers() {
    fetch('/users', { headers: { authorization: 'Bearer ' + localStorage.jwt } })
        .then(response => {
            if (response.ok) {
                return response.json()
            }
            location.href = "/"
        })
        .then(users => userList.innerHTML = users.map(buildUserItem).join(''))
}

let GoBack = function (){
    window.location.href = '/';
};