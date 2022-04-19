'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
    lifecycles: {
        async beforeCreate(data){
            const items = await strapi.query('navigation').find({_where: [{ordre_gte: data.ordre}]})
            const count = await strapi.query('navigation').count().then(value => {return value})
            if(data.ordre > count + 1){
                data.ordre = count + 1
            }
            else if(data.ordre < 1){
                data.ordre = 1
                const allItems = await strapi.query('navigation').find()
                for(let i = 0;i<allItems.length;i++){
                    await strapi.query('navigation').update({id : allItems[i].id}, {ordre: allItems[i].ordre + 1})
                }
            }
            else{
                for(let i = 0; i < items.length; i++){
                    await strapi.query('navigation').update({id : items[i].id}, {ordre: items[i].ordre + 1})
                }
            } 
        },

        async afterDelete(result){
            const allItems = await strapi.query('navigation').find({_where: [{ordre_gt: result.ordre}]})
            for(let i = 0; i< allItems.length;i++){
                await strapi.query('navigation').update({id: allItems[i].id}, {ordre: allItems[i].ordre - 1})
            }
        },

        async beforeUpdate(params,data){
            const countAllItems = await strapi.query('navigation').count().then(value => { return value })
            if(data.ordre < 1 || data.ordre > countAllItems){
                throw strapi.errors.badRequest("to update : ordre >= 1 && ordre <= "+countAllItems)
            }
            const oldOrdre = await strapi.query('navigation').find(params).then(item => { return item[0].ordre })
            const otherIdOrdre = await strapi.query('navigation').find({_where: [{ordre: data.ordre}]}).then(items => {if( items.length > 0) return items[0].id })
            if(otherIdOrdre !== undefined && oldOrdre > data.ordre){
                await strapi.query('navigation').update({id : otherIdOrdre}, {ordre: oldOrdre})
            }          
        }
    }
};
