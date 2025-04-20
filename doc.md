## AUTHENTICATION

<b>Token-based auth</b> : The server creates a secure token that contains encrypted information about who you are.
                Your app stores this token and sends it with future requests to prove your identity.

https://app.eraser.io/workspace/W2vUAMARfSszqlztu8TJ

## PAGINATION & INFINITE LOADING
<b>Pagination</b> : devides content into pages. You load only a specific chunk of data at a time.

How it works:
1.	Frontend asks the backend: “Give me page 2 with 10 items per page.”
2.	Backend responds with items 11 to 20.
3.	You show a UI with page numbers or next/previous buttons.
---

<b>Infinite Scrolling</b> : Instead of clicking a "Next" button, more items load as the user scrolls down.

How it works:
1.	Page loads the first 10 items.
2.	As the user scrolls to the bottom, it triggers a new request.
3.	Backend gives the next set of items (e.g. next 10).
4.	New items are appended to the list, smoothly.