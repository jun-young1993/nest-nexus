import {Inject, Injectable} from '@nestjs/common';
import {Cron, CronExpression} from "@nestjs/schedule";
import {WINSTON_MODULE_PROVIDER} from "nest-winston";
import {Logger} from 'winston'
import {AlieAffiliateService} from "../alie/alie-affiliate.service";
import {GithubContentService} from "../github/github-content.service";
import {OpenaiService} from "../openai/openai.service";
import shuffle from "../utils/shuffle";
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { GeminiService } from 'src/gemini/gemini.service';

@Injectable()
export class TasksService {
    constructor(
        private readonly alieAffiliateService: AlieAffiliateService,
        private readonly githubContentService: GithubContentService,
        private readonly openaiService: OpenaiService,
        private readonly configService: ConfigService<AllConfigType>,
        private readonly geminiService: GeminiService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async test(){
        if(this.configService.get('app.is_dev',{infer: true})){
            this.logger.info('[TEST][SKIP TEST CRON IN DEVELOPMENT]');
            return false;
        }
        this.logger.info('[TEST][START]');
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async createAlieHotProductPromotionOpenAi(){
        if(true || this.configService.get('app.is_dev',{infer: true})){
            this.logger.info('[CREATE ALIE HOT PRODUCT PROMOTION][SKIP CREATE ALIE HOT PRODUCT PROMOTION IN DEVELOPMENT]');
            return false;
        }

        this.logger.info('[CREATE ALIE HOT PRODUCT PROMOTION][START]');
        this.getAlieHotProductPromotion(async (userContent) => {
            const completion = await this.openaiService.chatCompletions({
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant specialized in creating promotional blog posts in Markdown format."
                    },
                    {
                        role: "user",
                        content: userContent
                    }
                ],
                model: 'gpt-4o'
            });
            return completion.choices[0].message.content
        })

    }

    async getAlieHotProductPromotion(promptFunction: (prompt: string) => Promise<string>){
        this.logger.info('[ALIE HOT PRODUCT PROMOTION][START]');

        const githubAlieRepository = 'alie-promotion-blog-storage';
        const limitCount = 1;
        let startCount = 0;
        try{
            const categoryResponse = await this.alieAffiliateService.getCategories();
            if(categoryResponse?.aliexpress_affiliate_category_get_response){
                const alieExpressAffiliateCategoryGetResponse = categoryResponse.aliexpress_affiliate_category_get_response;
                if(alieExpressAffiliateCategoryGetResponse?.resp_result){
                    const respResult = alieExpressAffiliateCategoryGetResponse?.resp_result;
                    if(respResult?.resp_code && respResult?.resp_msg){
                        if(respResult?.resp_code === 200){
                            let categories:[{category_id: number, parent_category_id?: number, category_name: string}] = respResult.result.categories.category;

                            if(Array.isArray(categories)){
                                categories = shuffle(categories);
                                const emptyCategoryIds = [];
                                for(const category of categories){
                                    this.logger.info(`${startCount}>${limitCount}`);
                                    if(startCount > limitCount){
                                        this.logger.info(`[ALIE HOT PRODUCT PROMOTION][END]`);
                                         return ;
                                    }
                                    const parentCategoryId = category.parent_category_id;
                                    if(parentCategoryId){
                                        if(emptyCategoryIds.includes(parentCategoryId)){
                                            continue;
                                        }
                                    }


                                    const hotProductResponse = await this.alieAffiliateService.queryHotProducts(category.category_id);

                                    if(hotProductResponse?.aliexpress_affiliate_hotproduct_query_response){
                                        const hotProductResult = hotProductResponse?.aliexpress_affiliate_hotproduct_query_response.resp_result;
                                        if(hotProductResult.resp_code === 200){
                                            const categoryName = category.category_name;
                                            const products = hotProductResult.result.products.product;

                                            if(Array.isArray(products)){
                                                for(const product of products){

                                                    const title = product.product_title;
                                                    const blogPath = `${categoryName}/${title}.md`
                                                    const githubContentResult = await this.githubContentService.getContent(githubAlieRepository,blogPath);
                                                    if(githubContentResult === null){
                                                        const productUrl = product.product_detail_url;
                                                        const productImageUrl = product.product_main_image_url;
                                                        const price =product.target_original_price;
                                                        const salePrice = product.target_sale_price;
                                                        const category = product.second_level_category_name;
                                                        const promotionLink = product.promotion_link;
                                                        const evaluationRate = product.evaluate_rate;
                                                        const shopUrl = product.shop_url;
                                                        const messages = [
                                                            'Please write a promotional blog post for AliExpress in Markdown format that encourages people to click on the product link. The post should include an engaging introduction, a detailed product description, and a strong call-to-action. The tone should be friendly, conversational, and persuasive. Highlight the benefits of the product, include specific usage examples, emphasize the urgency of the sale, and incorporate customer reviews if possible. Make the content highly engaging and use social proof to attract more readers. Here is the product information:',
                                                            'Please write a promotional blog post for AliExpress in Markdown format that encourages people to click on the product link. The post should include an engaging introduction, a detailed product description, and a strong call-to-action. The tone should be friendly, conversational, and persuasive. Share a personal experience or story related to the product, highlight the benefits, include specific usage examples, and emphasize the urgency of the sale. Make the content highly engaging to attract more readers. Here is the product information:',
                                                            'Please write a promotional blog post for AliExpress in Markdown format that encourages people to click on the product link. The post should include an engaging introduction, a detailed product description, and a strong call-to-action. The tone should be friendly, conversational, and persuasive. Emphasize the limited-time nature of the sale, highlight the benefits of the product, include specific usage examples, and incorporate customer reviews if possible. Make the content highly engaging and create a sense of urgency to attract more readers. Here is the product information:',
                                                            'Please write a promotional blog post for AliExpress in Markdown format that encourages people to click on the product link. The post should include an engaging introduction, a detailed product description, and a strong call-to-action. The tone should be friendly, conversational, and persuasive. Highlight the benefits of the product, include specific usage examples, and emphasize the social proof such as customer reviews and ratings. Make the content highly engaging to attract more readers. Here is the product information:'
                                                        ];
                                                        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                                                        if(!randomMessage){
                                                            continue;
                                                        }
                                                        let userContent = `
                                                              ${randomMessage}

                                                            - **Product Title**: ${title}
                                                            - **Product URL**: ${productUrl}
                                                            - **Image URL**: ${productImageUrl}
                                                            - **Price**: $${price}
                                                            - **Sale Price**: $${salePrice}
                                                            - **Category**: ${category}
                                                            - **Promotion Link**: ${promotionLink}
                                                            - **Evaluation Rate**: ${evaluationRate}
                                                            - **Shop URL**: ${shopUrl}
                                                           `;
                                                        this.logger.info('[ALIE HOT PRODUCT PROMOTION]\r\n'+userContent);
                                                        const product_small_images = product?.product_small_image_urls;
                                                        
                                                        if(product_small_images){
                                                            if(product_small_images?.string){
                                                                const urls = product_small_images?.string;
                                                                if(Array.isArray(urls)){
                                                                    for(const smallUrl of urls){
                                                                        userContent+=`
                                                                        - **product_small_image_urls**: ${smallUrl}`;
                                                                    }

                                                                }
                                                            }
                                                        }
                                                        const mainLinkImage = `[![${productImageUrl}](${productImageUrl})](${promotionLink})`;
                                                        const hereLink = `# [**Click Here To Buy!**](${promotionLink})`;
                                                        const resultContent = await promptFunction(userContent);
                                                        const uploadContnet = mainLinkImage+'\r\n'+hereLink+'\r\n'+resultContent.replace(/```markdown/g, '\r\n');
                                                        this.logger.info('[ALIE HOT PRODUCT PROMOTION]\r\n'+uploadContnet);
                                                        const githubCreateContent = await this.githubContentService.createContent(githubAlieRepository,blogPath,uploadContnet);
                                                        this.logger.info('[ALIE HOT PRODUCT PROMOTION][GITHUB CREATE CONTENT]\r\n'+JSON.stringify(githubCreateContent));
                                                        startCount++;
                                                        
                                                        throw new Error('end');
                                                        emptyCategoryIds.push(category.category_id);
                                                        
                                                        
                                                        break;
                                                    }

                                                }
                                                continue;
                                            }



                                            throw new Error('[The "products" value is not of array type.]')
                                        }else if(hotProductResult.resp_code === 405){
                                            emptyCategoryIds.push(category.category_id);
                                            continue;
                                        }
                                        throw new Error('[It it not a 405 or 200 success value] :'+hotProductResult.resp_code+' '+ hotProductResult.resp_msg)

                                    }
                                    throw new Error('[The Key value "aliexpress_affiliate_hotproduct_query_response" cannot be found]')
                                }

                                return true;
                            }
                            throw new Error('[The "categories" value is not of array type.]')
                        }
                        throw new Error('[It it not a 200 success value] :'+ respResult.resp_msg)
                    }
                    throw new Error('[The Key value "resp_code" OR "resp_msg" cannot be found]')
                }
                throw new Error('[The Key value "aliexpress_affiliate_category_get_resp_result" cannot be found]')
            }
            throw new Error('[The Key value "aliexpress_affiliate_category_get_response" cannot be found]');
        }catch(error){
            
            this.logger.info('[ALIE HOT PRODUCT PROMOTION][EXCEPTION]');
            this.logger.info(error.toString());
        }



    }

    @Cron(CronExpression.EVERY_HOUR)
    async createAlieHotProductPromotionGemini(){
        if(this.configService.get('app.is_dev',{infer: true})){
            this.logger.info('[CREATE ALIE HOT PRODUCT PROMOTION GEMINI][SKIP CREATE ALIE HOT PRODUCT PROMOTION IN DEVELOPMENT]');
            return false;
        }
        this.logger.info('[CREATE ALIE HOT PRODUCT PROMOTION GEMINI][START]');
        this.getAlieHotProductPromotion((prompt)=>{
            return this.geminiService.sendMessage(
                'You are a helpful assistant specialized in creating promotional blog posts in Markdown format. \r\n' 
                + prompt
            );
        })
    }
}
