export async function createSecretEngine(path: string) {
    const file = Bun.file(path);
    const fileExists = await file.exists()
    if (!fileExists)
        return undefined;

    let secrets: { [key: string]: { [key: string]: string } } = await file.json();

    return {
        get secrets() {
            return secrets
        },
        addUser: (userId: string) => {
            const existingUser = secrets[userId];
            if (existingUser)
                return;
            secrets[userId] = {}
            Bun.write(file, JSON.stringify(secrets))
        },
        removeUser: (userId: string) => {
            delete secrets[userId]
            Bun.write(file, JSON.stringify(secrets))
        },
        addSecret: (userId: string, pipelineId: string, secret: string) => {
            const existingUser = secrets[userId];
            if (!existingUser)
                return;
            secrets[userId] = { ...existingUser, [pipelineId]: secret }
            Bun.write(file, JSON.stringify(secrets))
        },
        removeSecret: (userId: string, connId: string) => {
            delete secrets[userId][connId]
            Bun.write(file, JSON.stringify(secrets))
        }
    }
}