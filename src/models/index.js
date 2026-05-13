import User from '../modules/users/user.model.js';
import Category from '../modules/categories/category.model.js';
import Article from '../modules/articles/article.model.js';
import PageView from '../modules/articles/pageView.model.js';
import Customer from '../modules/customers/customer.model.js';
import AdPlacement from '../modules/ads/adPlacement.model.js';
import Ad from '../modules/ads/ad.model.js';
import AdEvent from '../modules/ads/adEvent.model.js';

// Article associations
Article.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Article.belongsTo(User,     { foreignKey: 'author_id',   as: 'author'   });
Category.hasMany(Article,   { foreignKey: 'category_id' });
User.hasMany(Article,       { foreignKey: 'author_id'   });

Ad.belongsTo(Customer,    { foreignKey: 'customer_id',  as: 'customer'  });
Ad.belongsTo(AdPlacement, { foreignKey: 'placement_id', as: 'placement' });
Customer.hasMany(Ad,      { foreignKey: 'customer_id'  });
AdPlacement.hasMany(Ad,   { foreignKey: 'placement_id' });

PageView.belongsTo(Article, { foreignKey: 'article_id' });
AdEvent.belongsTo(Ad,       { foreignKey: 'ad_id'      });

export { User, Category, Article, Customer, AdPlacement, Ad, PageView, AdEvent };
