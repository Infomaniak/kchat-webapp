console.log(self);
self.addEventListener('fetch', event => {
    console.log("evented", event)
    // let token = new URL(location).searchParams.get('token');
    let token = 'test token'
    console.log("my token", token)
    const newRequest = new Request(event.request, {
        headers: { "Authorization": `Bearer ${token}` },
        mode: "no-cors",
    });
    return fetch(newRequest);
});
