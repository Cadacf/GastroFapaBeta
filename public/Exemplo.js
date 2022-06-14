const update = document.querySelector('#update-button')
const deleteButton = document.querySelector('#delete-button')
const data = {
  name: 'Darth Vadar',
  menu: 'I find your lack of faith disturbing.'
}
const messageDiv = document.querySelector('#message')

update.addEventListener('click', _ => {
  fetch('/menuitens', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Darth Vadar',
      menu: 'I find your lack of faith disturbing.'
    })
  })
    .then(res => {
      if (res.ok) return res.json()
    })
    .then(response => {
      console.log(response)
      window.location.reload(true)
    })
})

deleteButton.addEventListener('click', _ => {
  fetch('/menuitens', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Darth Vadar'
    })
  })
    .then(res => {
      if (res.ok) return res.json()
    })
    .then(response => {
      if (response === 'No menu to delete') {
        messageDiv.textContent = 'No Darth Vadar menu to delete'
      } else {
        window.location.reload()
      }
    })
})