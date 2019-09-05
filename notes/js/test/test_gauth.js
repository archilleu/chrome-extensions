document.addEventListener('DOMContentLoaded', () => {

    debugger;

    const auth = new GAuth();

    auth.auth({
        success: (token) => {
            console.info(token);

            if (!auth.checkAuth()) {
                throw new Error("auth failed");
            }

            auth.removeCachedAuth({
                success: (token) => {
                    auth.revokeAuth({
                        success: () => {
                            console.info("revoke success");
                        },
                        error: () => {
                            throw new Error("revokeAuth:" + error);
                        }
                    });
                },
                error: (error) => {
                    throw new Error("auth:" + error);
                }
            });
        },

        error: (error) => {
            throw new Error("auth:" + error);
        }
    });




});