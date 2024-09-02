let categories = [{ id: 1, name: "salary" }];

export const getAllCategoriesFN = () => {
    return categories;
};


export const addNewCategory = (category) => {
    const newCategory = {
        id: categories.length + 1,
        name: category,
    };
    categories.push(newCategory);
    return newCategory;
};


export const validateCategory = (categoryId) => {
    return categories.find((category) => category.id === categoryId);
};