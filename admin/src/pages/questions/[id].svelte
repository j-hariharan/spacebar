<script>
    export let id

    const db = firebase.firestore()

    let data = false
    let level = ""
    let alllevels = []
    let prompt = ""
    let name = ""

    async function getalllevels () {
        let qs = await db.collection('levels').get()
        qs.docs.map(doc => {
            alllevels.push({
                id: doc.id,
                name: doc.get('name')
            })
        })
    }

    async function getquestion () {
        let q_doc = await db.collection('questions').doc(id).get()

        level = q_doc.get('level')
        prompt = q_doc.get('prompt')
        name = q_doc.get('name')

        let level_doc = await db.collection('levels').doc(level).get()

        await getalllevels()

        data = {
            id: q_doc.id,
            ...await q_doc.data(),
            level: {
                id: level,
                ...await level_doc.data()
            }
        }

        return data
    }

    async function changename () {
        if (!name) {
            alert('invalid name')
            return
        }

        await db.collection('questions').doc(id).update({
            name
        })

        window.location = './'+id
    }

    async function changeprompt () {
        await db.collection('questions').doc(id).update({
            prompt
        })

        window.location = './'+id
    }


</script>




{#await getquestion()}
    <p>Loading...</p>
{:then data} 
    <h1>{data.name}</h1>

    <br><br>

    <h2>Prompt:</h2>
    <p>{data.prompt}</p>

    <h2>Answer:</h2>
    <p>{data.answer}</p>

    <h2>Points:</h2>
    <p>{data.points}</p>

    {#if data.download_name}
        <h2>Download:</h2>
        <a href={data.download}>{data.download_name}</a>
        
        <br><br><br>
    {/if}

    <img src={data.image} alt="">

    <br><br><br><br>

    <h2>Edit name:</h2>
    <input type="text" bind:value={name}>
    <button on:click={changename}>Change</button>

    <br><br>
    
    <h2>Edit prompt:</h2>
    <textarea bind:value={prompt} rows=10 cols=100></textarea><br>
    <button on:click={changeprompt}>Change</button>



{/await}


<style>
    h2 {
        font-size: 20px;
    }
    
    h1 {
        text-decoration: underline;
    }
</style>