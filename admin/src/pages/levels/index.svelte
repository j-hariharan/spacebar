<script>
    const db = firebase.firestore()

    async function getlevels () {
        const qs = await db.collection('levels').orderBy('name').get()

        const data = await Promise.all(qs.docs.map(async doc => {
            return {
                ...await doc.data(),
                id: doc.id
            }
        }))

        return data
    }
</script>


<h1>Levels</h1>

{#await getlevels()}
    <p>Loading...</p>
{:then levels} 
    
    <ul>
        {#each levels as level}
            <li><a href="/levels/{level.id}">{level.name}</a></li>
        {/each}
    </ul>


{/await}
