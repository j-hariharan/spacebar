<script>
  let username, password;
  const db = firebase.firestore();

  let alreadyused = [];

  async function findalreadyused() {
    let qs = await db.collection("participants").get();
    let usernames = [];

    qs.docs.map((doc) => usernames.push(doc.get("username")));
    alreadyused = usernames;
  }

  async function submit() {
    if (!username || !password) {
      alert("Enter all details");
      return;
    }

    if (!alreadyused.length) {
      await findalreadyused();
    }

    if (alreadyused.includes(username)) {
      alert("username already exists");
      return;
    }

    const docref = await db.collection("participants").add({
      password,
      username,
      points: {},
    });

    window.location = "/participants/" + docref.id;
  }
</script>

<h1>Create Participant</h1>

<br /><br />

<form on:submit|preventDefault={submit}>
  <label for="username">Username:</label>
  <input type="text" bind:value={username} required />

  <br /><br />

  <label for="password">Password:</label>
  <input type="text" bind:value={password} required />

  <br /><br />

  <button type="Submit">Create</button>
</form>
