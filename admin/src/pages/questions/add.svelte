<script>
    let db = firebase.firestore()
    let name, prompt, answer, points, download, download_name, image, level, hint_prompt, points_reduced

    async function create (e) {
        e.preventDefault()

        if (!level) {
            alert('choose a level')
            return
        }

        let data = {
            name, prompt, answer, points, level
        }

        if (download && !download_name) {
            alert('please enter download name')
            return 
        }

        let download_input = document.querySelector('#download')
        let image_input = document.querySelector('#image')

        if (download_input.files[0]) {
            let storageref = firebase.storage().ref(name + '/' + download_name)
            let res = await storageref.put(download_input.files[0])
            let download_url = await res.ref.getDownloadURL()
            
            data.download = download_url
            data.download_name = download_name
        }

        if (image_input.files[0]) {
            let storageref = firebase.storage().ref(name + '/' + image_input.files[0].name)
            let res = await storageref.put(image_input.files[0])
            let download_url = await res.ref.getDownloadURL()

            data.image = download_url
        }

        if (hint_prompt) {
            if (!points_reduced) {
                alert('enter points reduced')
                return
            }
            data.hints = [
                {
                    prompt: hint_prompt,
                    points_reduced
                }
            ]
        }

        else {
            data.hints = []
        }

        let docref = await db.collection('questions').add({
            ...data
        })

        window.location = './'+docref.id
    }

    async function getlevels () {
        let qs = await db.collection('levels').orderBy('deadline').get()

        return await Promise.all(qs.docs.map(async doc => {
            return {
                id: doc.id,
                ...await doc.data()
            }
        }))
    }
</script>


<form on:submit={create}>

<label for="name">Name</label>
<input type="text" bind:value={name} required>

<br>

<label for="prompt">Prompt</label>
<textarea bind:value={prompt} required rows=10 cols=100></textarea>

<br>

<label for="answer">Answer</label>
<input type="text" bind:value={answer} required>

<br>

<label for="points">Points</label>
<input type="number" bind:value={points} required>

<br>

<!-- level -->

<label for="download">Download File</label>
<input type="file" bind:value={download} id="download">

<br>

<label for="download_name">Download File Name</label>
<input type="text" bind:value={download_name}>

<br>

<label for="image">Image File</label>
<input type="file" bind:value={image} id="image" accept="image/*">

<br><br><br>

<h3>Level</h3>

{#await getlevels()}
    Loading...
{:then levels} 
    {#each  levels as l}
        <label>
            <input type=radio bind:group={level} name="scoops" value={l.id}>
            {l.name}
        </label>
    {/each}
{/await}

<br><br><br>

<h3>Hint</h3>

<label for="prompt">Prompt</label>
<textarea bind:value={hint_prompt} rows=10 cols=100></textarea>

<label for="prompt">Points Reduced</label>
<input type="number" bind:value={points_reduced}>


<br>

<button type="submit">Create</button>


</form>