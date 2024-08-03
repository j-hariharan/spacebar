<script>
    export let id

    const db = firebase.firestore()
    let allparticipants = []
    let selected = []
    let data = false
    let deadline = false

    $: ischanged = 
        data &&
        (
            selected.filter(p => !data.participants.includes(p)).length ||
            data.participants.filter(p => !selected.includes(p)).length
        );

    async function getallparticipants () {
        let qs = await db.collection('participants').get()

        qs.docs.map(doc => {
            allparticipants.push({
                id: doc.id,
                ...doc.data()
            })
        })

        allparticipants.map(p => {
            if (data.participants.includes(p.id)) {
                selected.push(p.id)
            }
        })

        selected = selected
    }

    async function getdata () {
        const doc = await db.collection("levels").doc(id).get()
        data = await doc.data()

        await getallparticipants()

        return {
            ...data,
            id
        }
    }

    async function saveparticipants () {
        await db.collection('levels').doc(id).update({
            participants: selected
        })

        window.location = "./"+id
    }

    async function close () {
        await db.collection('levels').doc(id).update({
            opened: false
        })

        window.location = "./"+id
    }

    async function open () {
        await db.collection('levels').doc(id).update({
            opened: true
        })

        window.location = "./"+id
    }

    async function editdeadline () {
        if (!deadline) {
            alert('date not changed')
            return
        }

        await db.collection('levels').doc(id).update({
            deadline: new Date(deadline)
        })

        window.location = "./"+id
    }

    function sorter (a, b) {
        if (!a.points[id]) return 1
        if (!b.points[id]) return -1
        if (a.points[id] < b.points[id]) return 1
    }
</script>


{#await getdata()}
    <p>Loading...</p>
{:then level} 
    <h1>{level.name}</h1>

    <h3>Deadline: {new Date(level.deadline.seconds*1000)}</h3>

    <label for="deadline">Edit deadline:</label>
    <input type="datetime-local" bind:value={deadline}>
    <button on:click = {editdeadline}>Change</button>

    <br><br>

    <h3>Opened: 
        {#if level.opened}
            {"✔️"} &nbsp;&nbsp;&nbsp;&nbsp; <button on:click={close}>close</button>
        {:else}
            {"❌"} &nbsp;&nbsp;&nbsp;&nbsp; <button on:click={open}>open</button>
        {/if}
    </h3>

    <br><br>

    <h3>Participants:</h3>
    {#each allparticipants as p}
        <label>
            <input type=checkbox bind:group={selected} value={p.id}>
            {p.username}
        </label>
    {/each}

    <br><br>

    {#if ischanged}
        <button on:click = {saveparticipants}>Save Changes</button>
    {/if}

    <table>
        <tr>
            <th>Participant</th>
            <th>Points</th>
        </tr>
        
        {#each allparticipants.sort(sorter) as p}
            <tr>
                <td><a href="/participants/{p.id}">{p.username}</a></td>
                <td>{p.points[id] || "N.A."}</td>
            </tr>
        {/each}
    </table>

{/await}


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