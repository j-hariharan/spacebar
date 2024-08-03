<script>
    const db = firebase.firestore()
  
    async function getData() {
      const qs = await db.collection("participants").get();
      const data = await Promise.all(
        qs.docs.map(async (doc) => {
          return { id: doc.id, ...(await doc.data()) };
        })
      )
  
      return data
    }
  </script>
  
  <h1>Participants</h1>

  <a href="/participants/add">add participant</a>
  
  {#await getData()}
    <p>Loading...</p>
  {:then data}
  
    <ul>
  
  
      {#each data as participant}
        
        <li><a href={"/participants/"+participant.id}>{participant.username}</a></li>
  
      {/each}
  
  
    </ul>
  
  {/await}
  