<script>
  export let id;
  const db = firebase.firestore();

  let username = "";
  let password = "";
  let del = "";

  let data = false;

  let alreadyused = [];
  let pqs = [];

  async function findalreadyused() {
    let qs = await db.collection("participants").get();
    let usernames = [];

    qs.docs.map((doc) => usernames.push(doc.get("username")));
    alreadyused = usernames;
  }

  async function getUser() {
    const doc = await db.collection("participants").doc(id).get();
    data = { id: doc.id, ...(await doc.data()) };

    let qs = await db.collection('levels').get() 

    data.levels = await Promise.all(qs.docs.map(async level => {
      return {
        id: level.id,
        points: data.points[level.id] ||"N.A.",
        ...await level.data()
      }
    }))

    getparticipantquestions()

    return data;
  }

  async function getparticipantquestions () {
    const qs = await db.collection('participants').doc(id).collection('questions').orderBy('level').get()

    qs.docs.map(doc => {
      pqs.push({
        id: doc.id,
        ...doc.data(),
        level: data.levels.filter(d => d['id'] == doc.get('level'))[0].name
      })
    })

    pqs = pqs

  }

  async function updateusername() {
    if (!username) {
      alert("enter details");
      return;
    }

    if (!alreadyused.length) {
      await findalreadyused();
    }

    if (alreadyused.includes(username)) {
      alert("username already exists");
      return;
    }

    await db.collection("participants").doc(id).update({
      username,
    });

    window.location = ".";
  }

  async function updatepassword() {
    if (!password) {
      alert("enter details");
      return;
    }

    await db.collection("participants").doc(id).update({
      password,
    });

    window.location = "./" + id;
  }

  async function deleteparticipant() {
    if (del != "delete") {
      alert("did not delete");
      return;
    }

    await db.collection("participants").doc(id).delete();

    window.location = "./";
  }
</script>

{#await getUser()}
  <p>Loading...</p>
{:then data}
  <h2>{data.username}</h2>
  <h4>Password: {data.password}</h4>
  <br /><br />
  <h3>Points:</h3>
  <ul>
    {#each data.levels as level}
      <li><a href="/levels/{level.id}">{level.name}</a>: {level.points}</li>
    {/each}
  </ul>
{/await}

<br /><br /><br /><br /><br /><br /><br /><br />

<h2>Update participant</h2>

<div>
  <h3>Change username</h3>
  <label for="username">Username:</label>
  <input bind:value={username} required />
  <button on:click={updateusername}>update</button>
</div>

<div>
  <h3>Change password</h3>
  <label for="password">Password:</label>
  <input bind:value={password} required />
  <button on:click={updatepassword}>update</button>
</div>

<div>
  <h3>Delete Participant</h3>
  <label for="delete">Enter "delete":</label>
  <input bind:value={del} required />
  <button on:click={deleteparticipant}>delete (PLEASE BE SURE!)</button>
</div>

<br><br><br><br><br>

<h2>Levels</h2>
<table>
  <tr>
    <th>Question</th>
    <th>Level</th>
    <th>Points</th>
    <th>Answered</th>
  </tr>

  {#each pqs as pq}
    <tr>
      <td><a href={"/questions/"+pq.id}>{pq.id}</a></td>
      <td>{pq.level}</td>
      <td>{pq.total_points}</td>
      <td>{pq.answered ? "✔️" : "❌"}</td>
    </tr>
  {/each}
</table>

<style>
  table {
    text-align: center;
    margin: 30px;
  }

  th {
    font-size: 25px;
  }

  td, th {
    padding: 20px 40px;
    border: 1px solid black;
  }

</style>