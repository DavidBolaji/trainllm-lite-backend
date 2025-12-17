import app from "./app";
const PORT = process.env.PORT || 5500;

app.listen(PORT, async () => {


    console.log(`Server is running on ${PORT}`);
});