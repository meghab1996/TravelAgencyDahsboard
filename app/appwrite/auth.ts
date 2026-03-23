import { ID, OAuthProvider, Permission, Query, Role } from "appwrite"
import { account, appwriteConfig, database, tables } from "./client"
import { data, redirect } from "react-router"
import { attributes } from "@syncfusion/ej2-base"

export const loginWithGoogle = async()=>{
    try{
        await account.createOAuth2Session(
            OAuthProvider.Google,
        )
    }
    catch(e){
        console.log(e)
    }
}


export const getUser= async()=>{

    try{
        const user = await account.get()
        if(!user) return redirect('/sign-in')
        // Using the modern TablesDB service
        const { rows: documents } = await tables.listRows({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.userCollectionId, 
        queries: [
            Query.equal('accountId', user.$id),
            Query.select(['name', 'email', 'imageUrl', 'joinedAt', 'accountId'])
        ]
    });
    }
    catch(e){
        console.log(e)
    }
}

export const logoutUser = async()=>{
    try{
        await account.deleteSession({sessionId:'current'})
        return true
    }
    catch(e){
        console.log({message:'logoutUser error',e})
        return false
    }
}



export const getGooglePicture = async()=>{
    try{
        const session = await account.getSession({sessionId:'current'})

        const oAuthToken = session.providerAccessToken
        if(!oAuthToken){
            console.log({message:'No Auth Token available'})
            return null
        }

        //Make a request to the Google People API to get the prfile photo
        const response = await fetch(
            'https://people.googleapis.com/v1/people/me?personFields=photos',
            {
                headers:{
                    Authorization:`Bearer ${oAuthToken}`
                }
            }
        )
        if(!response.ok){
            console.log({message:'Failed to fetch profile photo from Google People API'})
            return null
        }

        const data = await response.json()

        const photoUrl =  data.photos && data.photos.length>0
        ? data.photos[0].url
        :null
        
        return photoUrl
    }

    catch(e){
        console.log({message:'getGooglePicture error', e})
        return null
    }
}

export const storeUserData= async()=>{
    try{
        const user = await account.get()

        if(!user) return null;

        //check if user already exists in the database

    const { rows: documents } = await tables.listRows({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.userCollectionId, // Note: collectionId becomes tableId
        queries: [Query.equal('accountId', user.$id)]
    });
    
    if(documents.length >0) return documents[0]

    // get profile photo from Google

    const imageUrl = await getGooglePicture()

    // create new user account

    const newUser = await tables.createRow({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.userCollectionId,
        rowId: ID.unique(),
        data: {
            accountId: user.$id,
            email: user.email,
            name: user.name,
            imageUrl: imageUrl || '',
            joinedAt: new Date().toISOString()
        }
    })
     return newUser
    }
    catch(e){
        console.log('Store User data',e)
    }
}

export const getExistingUser = async()=>{
    try{
        const user = await account.get();

        if(!user) return null

        //check if user exists in the database

        const {rows: documents} = await tables.listRows({
           databaseId: appwriteConfig.databaseId,
           tableId:appwriteConfig.userCollectionId,
            [Query.equal('accountId', user.$id)]
    })
        if(documents.length===0) return null;
        return documents[0]
    }
    catch(e){
        console.log("getExistingUser error",e)
        return null
    }
}