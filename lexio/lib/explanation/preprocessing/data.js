const textItems = [
    {
        "id": "page_1",
        "block_type": "Page",
        "text": "A Deep Learning Based Approach for Traffic Data Imputation  Yanjie Duan, Yisheng Lv, Wenwen Kang, Yifei Zhao  Abstract — Traffic   data   is   a   fundamental   component   for applications and researches in transportation systems. How- ever, real traffic data collected from loop detectors or other channels often include missing data which affects the relative applications and researches. This paper proposes an approach based on deep learning to impute the missing traffic data. The proposed approach treats the traffic data including observed data and missing data as a whole data item and restores the complete data with the deep structural network. The deep learning approach can discover the correlations contained in the data structure by a layer-wise pre-training and improve the imputation accuracy by conducting a fine-tuning afterwards. We analyze the imputation patterns that can be realized with the proposed approach and conduct a series of experiments. The results show that the proposed approach can keep a stable error under different traffic data missing rate. Deep learning is promising in the field of traffic data imputation.  I. INTRODUCTION Traffic data is a fundamental component for applications and researches in transportation systems. Both route planning for individuals and transportation management and control for researchers and governments need sufficient traffic data [1]. However, real traffic data collected from loop detectors or other channels are often incomplete due to various reasons. These missing data make traffic analysis and other operations difficult in practice [2]. Traffic data imputation aims to fill in these missing data points as accurate as possible. It has been a hot topic [3] and will remain hot as traffic data are getting richer. In this paper, we propose a approach based on deep learning for traffic data imputation. To the best of our knowledge, it is the first time to introduce deep learning to the field of traffic data imputation. The specific architecture we use is denoising stacked autoencoder (DSAE) [4] which is composed of a denoising autoencoder (DAE) and stacked autoencoders (SAE) [5]. Considering the various patterns of traffic data imputation, we analyze all the possible patterns that can be realized with the proposed approach. To evaluate the performance of the approach, a series of experiments are conducted. The results show that our approach is rather competitive both in accuracy and in versatility. Additionally, our method needs little domain knowledge to obtain the imputed data during applications. That is convenient for researchers to get a complete data set in their researches.  This work was supported in part by the National Natural Science Foun- dation of China under Grants 71232006, 61233001, 61174172, 61104160, 61203079, 61203166. Yanjie Duan, Wenwen Kang and Yifei Zhao are with Qingdao Academy of Intelligent Industries, Qingdao, Shandong, 266109, China.   (e-mail: duanyanjie2012@ia.ac.cn).  Yisheng Lv is with Beijing Engineering Research Center of Intelligent Systems and Technology, Institute of Automation, Chinese Academy of Sciences, Beijing, 100190, China.  The rest of this paper is organized as follows: Section II reviews the related work in traffic data imputation and gives a brief introduction to deep learning. Section III describes the imputation approach based on DSAE. Section IV shows the experiments and results analysis. Section V makes the conclusions of this paper and gives some points of view in future work. II. RELATED WORK  A. Traffic Data Imputation  Because of the necessity of traffic data imputation, there have been many researches investigating this problem using a wide range of theories and methods. These methods are mainly based on time series analysis and prediction, non- parameter regression and statistical learning estimation [3]. Time series analysis and prediction method often uses his- torical data of the location to build a prediction framework and predict the missing data of the same location. The simplest method is to replace the missing data with the data in history usually the previous time period or the previous time interval. Another method is the autoregressive integrated moving-average (ARIMA) method [6] which is in common use. Non-parameter regression method often uses the data of neighboring locations or neighboring states to estimate the missing data of the current location. The missing data is estimated by the average or the weighted average of the neighboring data. A typical example of this method is k- NN method [7] of which the key work is to determine the neighbors by an appropriate distance metric. Statistical learning estimation method often uses the observed data to learn a scheme, then inferences the missing data in a fashion of iteration. A classical method is the Markov Chain Monte Carlo (MCMC) multiple imputation method [8][9]. The basic idea of MCMC multiple imputation method is to treat the missing data as a parameter of interest, draw a series of samples of the parameter and estimate the parameter using the samples. That means the imputation of the missing data is a combination of multiple imputed values instead of only one value. Another method is the neural networks [10] which is promising to obtain more accurate imputations than traditional imputation methods given more observed data. Due to the complex patterns of traffic data and the diversity of application scenarios, different methods are being used in the field of traffic data imputation. However, the existing methods usually treat the missing data separated from the observed data and need extra domain knowledge about the specific data and the method. From a new perspective, this paper considers the imputation process as the recovery of data which consists of missing and observed data. 2014 IEEE 17th International Conference on Intelligent Transportation Systems (ITSC) October 8-11, 2014. Qingdao, China  978-1-4799-6078-1/14/$31.00 ©2014 IEEE   912",
        "textItems": [
            [
                {
                    "text": "A Deep Learning Based Approach for Traffic Data Imputation",
                    "position": {
                        "top": 0.10737756286616161,
                        "left": 0.14030555026143793,
                        "width": 0.7193926795049018,
                        "height": 0.020126514962121214
                    },
                    "startIndex": 0,
                    "endIndex": 58
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.14700130018939397,
                        "left": 0.30033168915032676,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 59,
                    "endIndex": 59
                },
                {
                    "text": "Yanjie Duan, Yisheng Lv, Wenwen Kang, Yifei Zhao",
                    "position": {
                        "top": 0.14700130018939397,
                        "left": 0.30033168915032676,
                        "width": 0.3930699731347059,
                        "height": 0.013836995505050506
                    },
                    "startIndex": 60,
                    "endIndex": 108
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.10451470168300651,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 109,
                    "endIndex": 109
                },
                {
                    "text": "Abstract",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.10451470168300651,
                        "width": 0.050472628182761436,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 110,
                    "endIndex": 118
                },
                {
                    "text": "— Traffic",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.1550294090359477,
                        "width": 0.059146008700669946,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 119,
                    "endIndex": 128
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.2141754177366176,
                        "width": 0.010328941326225468,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 129,
                    "endIndex": 130
                },
                {
                    "text": "data",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.22450435906284308,
                        "width": 0.02767570236204248,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 131,
                    "endIndex": 135
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.2521800614248856,
                        "width": 0.010328941326225468,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 136,
                    "endIndex": 137
                },
                {
                    "text": "is",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.26250900275111105,
                        "width": 0.009772204063251633,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 138,
                    "endIndex": 140
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.2722812068143627,
                        "width": 0.010328941326225468,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 141,
                    "endIndex": 142
                },
                {
                    "text": "a",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.28261014814058816,
                        "width": 0.007325490302287582,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 143,
                    "endIndex": 144
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.2899356384428758,
                        "width": 0.010343592306830076,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 145,
                    "endIndex": 146
                },
                {
                    "text": "fundamental",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.30027923074970586,
                        "width": 0.07977458939191176,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 147,
                    "endIndex": 158
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.38005382014161754,
                        "width": 0.010328941326225468,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 159,
                    "endIndex": 160
                },
                {
                    "text": "component",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.390382761467843,
                        "width": 0.06918193041480392,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 161,
                    "endIndex": 170
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.4595646918826471,
                        "width": 0.010328941326225468,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 171,
                    "endIndex": 172
                },
                {
                    "text": "for",
                    "position": {
                        "top": 0.19908968606060615,
                        "left": 0.46989363320887256,
                        "width": 0.018343027716928095,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 173,
                    "endIndex": 176
                }
            ],
            [
                {
                    "text": "applications and researches in transportation systems. How-",
                    "position": {
                        "top": 0.2116679687626264,
                        "left": 0.08823529410130716,
                        "width": 0.40000107246611116,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 177,
                    "endIndex": 236
                }
            ],
            [
                {
                    "text": "ever, real traffic data collected from loop detectors or other",
                    "position": {
                        "top": 0.22424751459595968,
                        "left": 0.08823529410130716,
                        "width": 0.4000010724661111,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 237,
                    "endIndex": 299
                }
            ],
            [
                {
                    "text": "channels often include missing data which affects the relative",
                    "position": {
                        "top": 0.236827060429293,
                        "left": 0.08823529410130716,
                        "width": 0.4000010724661113,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 300,
                    "endIndex": 362
                }
            ],
            [
                {
                    "text": "applications and researches. This paper proposes an approach",
                    "position": {
                        "top": 0.2494053431313132,
                        "left": 0.08823529410130716,
                        "width": 0.4000010724661113,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 363,
                    "endIndex": 423
                }
            ],
            [
                {
                    "text": "based on deep learning to impute the missing traffic data. The",
                    "position": {
                        "top": 0.2619848889646465,
                        "left": 0.08823529410130716,
                        "width": 0.4000010724661111,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 424,
                    "endIndex": 486
                }
            ],
            [
                {
                    "text": "proposed approach treats the traffic data including observed",
                    "position": {
                        "top": 0.2745644347979798,
                        "left": 0.08823529410130716,
                        "width": 0.4000010724661114,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 487,
                    "endIndex": 547
                }
            ],
            [
                {
                    "text": "data and missing data as a whole data item and restores the",
                    "position": {
                        "top": 0.28714271750000003,
                        "left": 0.08823529410130716,
                        "width": 0.4000010724661114,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 548,
                    "endIndex": 607
                }
            ],
            [
                {
                    "text": "complete data with the deep structural network. The deep",
                    "position": {
                        "top": 0.29972226333333335,
                        "left": 0.08823529410130716,
                        "width": 0.4000010724661112,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 608,
                    "endIndex": 664
                }
            ],
            [
                {
                    "text": "learning approach can discover the correlations contained in",
                    "position": {
                        "top": 0.31230180916666667,
                        "left": 0.08823529410130716,
                        "width": 0.40000107246611116,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 665,
                    "endIndex": 725
                }
            ],
            [
                {
                    "text": "the data structure by a layer-wise pre-training and improve the",
                    "position": {
                        "top": 0.3248800918686869,
                        "left": 0.08823529410130716,
                        "width": 0.4000010724661114,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 726,
                    "endIndex": 789
                }
            ],
            [
                {
                    "text": "imputation accuracy by conducting a fine-tuning afterwards.",
                    "position": {
                        "top": 0.3374596377020202,
                        "left": 0.08823529410130716,
                        "width": 0.4000010724661112,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 790,
                    "endIndex": 849
                }
            ],
            [
                {
                    "text": "We analyze the imputation patterns that can be realized with",
                    "position": {
                        "top": 0.3500379204040404,
                        "left": 0.08823529410130716,
                        "width": 0.4000010724661111,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 850,
                    "endIndex": 910
                }
            ],
            [
                {
                    "text": "the proposed approach and conduct a series of experiments.",
                    "position": {
                        "top": 0.36261746623737373,
                        "left": 0.08823529410130716,
                        "width": 0.40000107246611116,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 911,
                    "endIndex": 969
                }
            ],
            [
                {
                    "text": "The results show that the proposed approach can keep a stable",
                    "position": {
                        "top": 0.37519701207070705,
                        "left": 0.08823529410130716,
                        "width": 0.4000010724661114,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 970,
                    "endIndex": 1031
                }
            ],
            [
                {
                    "text": "error under different traffic data missing rate. Deep learning",
                    "position": {
                        "top": 0.38777529477272726,
                        "left": 0.08823529410130716,
                        "width": 0.40000107246611116,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 1032,
                    "endIndex": 1094
                }
            ],
            [
                {
                    "text": "is promising in the field of traffic data imputation.",
                    "position": {
                        "top": 0.4003548406060606,
                        "left": 0.08823529410130716,
                        "width": 0.3265557066953758,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 1095,
                    "endIndex": 1148
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.4254684761742424,
                        "left": 0.21297058401960783,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1149,
                    "endIndex": 1149
                },
                {
                    "text": "I. INTRODUCTION",
                    "position": {
                        "top": 0.4254684761742424,
                        "left": 0.21297058401960783,
                        "width": 0.15052967302001624,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1150,
                    "endIndex": 1165
                }
            ],
            [
                {
                    "text": "Traffic data is a fundamental component for applications",
                    "position": {
                        "top": 0.44560483973484843,
                        "left": 0.10451470166666665,
                        "width": 0.3837228779526141,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1166,
                    "endIndex": 1222
                }
            ],
            [
                {
                    "text": "and researches in transportation systems. Both route planning",
                    "position": {
                        "top": 0.46070079972222217,
                        "left": 0.0882352894117647,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1223,
                    "endIndex": 1284
                }
            ],
            [
                {
                    "text": "for individuals and transportation management and control",
                    "position": {
                        "top": 0.475795496590909,
                        "left": 0.0882352894117647,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1285,
                    "endIndex": 1342
                }
            ],
            [
                {
                    "text": "for researchers and governments need sufficient traffic data",
                    "position": {
                        "top": 0.49089019345959584,
                        "left": 0.0882352894117647,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1343,
                    "endIndex": 1403
                }
            ],
            [
                {
                    "text": "[1]. However, real traffic data collected from loop detectors",
                    "position": {
                        "top": 0.5059848903282826,
                        "left": 0.0882352894117647,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1404,
                    "endIndex": 1465
                }
            ],
            [
                {
                    "text": "or other channels are often incomplete due to various reasons.",
                    "position": {
                        "top": 0.5210795871969695,
                        "left": 0.0882352894117647,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1466,
                    "endIndex": 1528
                }
            ],
            [
                {
                    "text": "These missing data make traffic analysis and other operations",
                    "position": {
                        "top": 0.5361742840656564,
                        "left": 0.0882352894117647,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1529,
                    "endIndex": 1590
                }
            ],
            [
                {
                    "text": "difficult in practice [2]. Traffic data imputation aims to fill",
                    "position": {
                        "top": 0.55127024405303,
                        "left": 0.0882352894117647,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1591,
                    "endIndex": 1654
                }
            ],
            [
                {
                    "text": "in these missing data points as accurate as possible. It has",
                    "position": {
                        "top": 0.5663649409217169,
                        "left": 0.0882352894117647,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1655,
                    "endIndex": 1715
                }
            ],
            [
                {
                    "text": "been a hot topic [3] and will remain hot as traffic data are",
                    "position": {
                        "top": 0.5814596377904038,
                        "left": 0.0882352894117647,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1716,
                    "endIndex": 1776
                }
            ],
            [
                {
                    "text": "getting richer. In this paper, we propose a approach based on",
                    "position": {
                        "top": 0.5965543346590906,
                        "left": 0.0882352894117647,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1777,
                    "endIndex": 1838
                }
            ],
            [
                {
                    "text": "deep learning for traffic data imputation. To the best of our",
                    "position": {
                        "top": 0.6116490315277774,
                        "left": 0.0882352894117647,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1839,
                    "endIndex": 1900
                }
            ],
            [
                {
                    "text": "knowledge, it is the first time to introduce deep learning to",
                    "position": {
                        "top": 0.6267437283964643,
                        "left": 0.0882352894117647,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1901,
                    "endIndex": 1962
                }
            ],
            [
                {
                    "text": "the field of traffic data imputation. The specific architecture",
                    "position": {
                        "top": 0.641839688383838,
                        "left": 0.0882352894117647,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1963,
                    "endIndex": 2026
                }
            ],
            [
                {
                    "text": "we use is denoising stacked autoencoder (DSAE) [4] which",
                    "position": {
                        "top": 0.6569343852525247,
                        "left": 0.0882352894117647,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2027,
                    "endIndex": 2083
                }
            ],
            [
                {
                    "text": "is composed of a denoising autoencoder (DAE) and stacked",
                    "position": {
                        "top": 0.6720290821212117,
                        "left": 0.0882352894117647,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2084,
                    "endIndex": 2140
                }
            ],
            [
                {
                    "text": "autoencoders (SAE) [5]. Considering the various patterns of",
                    "position": {
                        "top": 0.6871237789898985,
                        "left": 0.0882352894117647,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2141,
                    "endIndex": 2200
                }
            ],
            [
                {
                    "text": "traffic data imputation, we analyze all the possible patterns",
                    "position": {
                        "top": 0.7022184758585854,
                        "left": 0.0882352894117647,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2201,
                    "endIndex": 2262
                }
            ],
            [
                {
                    "text": "that can be realized with the proposed approach. To evaluate",
                    "position": {
                        "top": 0.7173144358459592,
                        "left": 0.0882352894117647,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2263,
                    "endIndex": 2323
                }
            ],
            [
                {
                    "text": "the performance of the approach, a series of experiments",
                    "position": {
                        "top": 0.732409132714646,
                        "left": 0.0882352894117647,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2324,
                    "endIndex": 2380
                }
            ],
            [
                {
                    "text": "are conducted. The results show that our approach is rather",
                    "position": {
                        "top": 0.7475038295833328,
                        "left": 0.0882352894117647,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2381,
                    "endIndex": 2440
                }
            ],
            [
                {
                    "text": "competitive both in accuracy and in versatility. Additionally,",
                    "position": {
                        "top": 0.7625985264520199,
                        "left": 0.0882352894117647,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2441,
                    "endIndex": 2503
                }
            ],
            [
                {
                    "text": "our method needs little domain knowledge to obtain the",
                    "position": {
                        "top": 0.7776932233207067,
                        "left": 0.0882352894117647,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2504,
                    "endIndex": 2558
                }
            ],
            [
                {
                    "text": "imputed data during applications. That is convenient for",
                    "position": {
                        "top": 0.7927879201893935,
                        "left": 0.0882352894117647,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2559,
                    "endIndex": 2615
                }
            ],
            [
                {
                    "text": "researchers to get a complete data set in their researches.",
                    "position": {
                        "top": 0.8078838801767673,
                        "left": 0.0882352894117647,
                        "width": 0.38351125410171555,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2616,
                    "endIndex": 2675
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.8330757989267672,
                        "left": 0.10207189138888889,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2676,
                    "endIndex": 2676
                },
                {
                    "text": "This work was supported in part by the National Natural Science Foun-",
                    "position": {
                        "top": 0.8330757989267672,
                        "left": 0.10207189138888889,
                        "width": 0.38615915494745096,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2677,
                    "endIndex": 2746
                }
            ],
            [
                {
                    "text": "dation of China under Grants 71232006, 61233001, 61174172, 61104160,",
                    "position": {
                        "top": 0.8443965054924238,
                        "left": 0.0882352894117647,
                        "width": 0.40000264549477127,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2747,
                    "endIndex": 2815
                }
            ],
            [
                {
                    "text": "61203079, 61203166.",
                    "position": {
                        "top": 0.8557184751893935,
                        "left": 0.0882352894117647,
                        "width": 0.11525389590196074,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2816,
                    "endIndex": 2835
                }
            ],
            [
                {
                    "text": "Yanjie Duan, Wenwen Kang and Yifei Zhao are with Qingdao Academy",
                    "position": {
                        "top": 0.8670391817550501,
                        "left": 0.10207189138888889,
                        "width": 0.38615915494745096,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2836,
                    "endIndex": 2900
                }
            ],
            [
                {
                    "text": "of Intelligent Industries, Qingdao, Shandong, 266109, China.",
                    "position": {
                        "top": 0.8783598883207068,
                        "left": 0.0882352894117647,
                        "width": 0.3253155163424837,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2901,
                    "endIndex": 2961
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8783598883207068,
                        "left": 0.41355080575424835,
                        "width": 0.004360943461437895,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2962,
                    "endIndex": 2963
                },
                {
                    "text": "(e-mail:",
                    "position": {
                        "top": 0.8783598883207068,
                        "left": 0.41791174921568625,
                        "width": 0.07032470690196078,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 2964,
                    "endIndex": 2972
                }
            ],
            [
                {
                    "text": "duanyanjie2012@ia.ac.cn).",
                    "position": {
                        "top": 0.8896818580176764,
                        "left": 0.08823528941176469,
                        "width": 0.21976470906862744,
                        "height": 0.011321212285353535
                    },
                    "startIndex": 2973,
                    "endIndex": 2998
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.9010025645833328,
                        "left": 0.10207189138888888,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2999,
                    "endIndex": 2999
                },
                {
                    "text": "Yisheng Lv is with Beijing Engineering Research Center of Intelligent",
                    "position": {
                        "top": 0.9010025645833328,
                        "left": 0.10207189138888888,
                        "width": 0.3861591549474509,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3000,
                    "endIndex": 3069
                }
            ],
            [
                {
                    "text": "Systems and Technology, Institute of Automation, Chinese Academy of",
                    "position": {
                        "top": 0.9123245342803027,
                        "left": 0.08823528941176469,
                        "width": 0.4000026454947711,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3070,
                    "endIndex": 3137
                }
            ],
            [
                {
                    "text": "Sciences, Beijing, 100190, China.",
                    "position": {
                        "top": 0.9236452408459591,
                        "left": 0.08823528941176469,
                        "width": 0.1807988516166013,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3138,
                    "endIndex": 3171
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.19908965693181768,
                        "left": 0.52804410374183,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3172,
                    "endIndex": 3172
                },
                {
                    "text": "The rest of this paper is organized as follows: Section II",
                    "position": {
                        "top": 0.19908965693181768,
                        "left": 0.52804410374183,
                        "width": 0.3837228779526147,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3173,
                    "endIndex": 3231
                }
            ],
            [
                {
                    "text": "reviews the related work in traffic data imputation and gives",
                    "position": {
                        "top": 0.21418435380050455,
                        "left": 0.511764691486928,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3232,
                    "endIndex": 3293
                }
            ],
            [
                {
                    "text": "a brief introduction to deep learning. Section III describes",
                    "position": {
                        "top": 0.22927905066919138,
                        "left": 0.511764691486928,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3294,
                    "endIndex": 3354
                }
            ],
            [
                {
                    "text": "the imputation approach based on DSAE. Section IV shows",
                    "position": {
                        "top": 0.24437374753787822,
                        "left": 0.511764691486928,
                        "width": 0.4000016357140525,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3355,
                    "endIndex": 3410
                }
            ],
            [
                {
                    "text": "the experiments and results analysis. Section V makes the",
                    "position": {
                        "top": 0.259469707525252,
                        "left": 0.511764691486928,
                        "width": 0.4000016357140523,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3411,
                    "endIndex": 3468
                }
            ],
            [
                {
                    "text": "conclusions of this paper and gives some points of view in",
                    "position": {
                        "top": 0.27456440439393887,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405234,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3469,
                    "endIndex": 3527
                }
            ],
            [
                {
                    "text": "future work.",
                    "position": {
                        "top": 0.2896591012626257,
                        "left": 0.511764691486928,
                        "width": 0.08193098781331691,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3528,
                    "endIndex": 3540
                }
            ],
            [
                {
                    "text": "II. RELATED WORK",
                    "position": {
                        "top": 0.31225379880050447,
                        "left": 0.6319574997385621,
                        "width": 0.1596132198508991,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3541,
                    "endIndex": 3557
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.33114647594696905,
                        "left": 0.511764691486928,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3558,
                    "endIndex": 3558
                },
                {
                    "text": "A. Traffic Data Imputation",
                    "position": {
                        "top": 0.33114647594696905,
                        "left": 0.511764691486928,
                        "width": 0.1795384193508986,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3559,
                    "endIndex": 3585
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.3500391530934337,
                        "left": 0.52804410374183,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3586,
                    "endIndex": 3586
                },
                {
                    "text": "Because of the necessity of traffic data imputation, there",
                    "position": {
                        "top": 0.3500391530934337,
                        "left": 0.52804410374183,
                        "width": 0.38372287795261406,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3587,
                    "endIndex": 3645
                }
            ],
            [
                {
                    "text": "have been many researches investigating this problem using",
                    "position": {
                        "top": 0.36513384996212056,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3646,
                    "endIndex": 3704
                }
            ],
            [
                {
                    "text": "a wide range of theories and methods. These methods are",
                    "position": {
                        "top": 0.38022854683080737,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405234,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3705,
                    "endIndex": 3760
                }
            ],
            [
                {
                    "text": "mainly based on time series analysis and prediction, non-",
                    "position": {
                        "top": 0.39532324369949423,
                        "left": 0.511764691486928,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3761,
                    "endIndex": 3818
                }
            ],
            [
                {
                    "text": "parameter regression and statistical learning estimation [3].",
                    "position": {
                        "top": 0.41041794056818104,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3819,
                    "endIndex": 3880
                }
            ],
            [
                {
                    "text": "Time series analysis and prediction method often uses his-",
                    "position": {
                        "top": 0.4255126374368679,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3881,
                    "endIndex": 3939
                }
            ],
            [
                {
                    "text": "torical data of the location to build a prediction framework",
                    "position": {
                        "top": 0.44060859742424163,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3940,
                    "endIndex": 4000
                }
            ],
            [
                {
                    "text": "and predict the missing data of the same location. The",
                    "position": {
                        "top": 0.45570329429292844,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405173,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4001,
                    "endIndex": 4055
                }
            ],
            [
                {
                    "text": "simplest method is to replace the missing data with the data",
                    "position": {
                        "top": 0.4707979911616153,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4056,
                    "endIndex": 4116
                }
            ],
            [
                {
                    "text": "in history usually the previous time period or the previous",
                    "position": {
                        "top": 0.4858926880303021,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405184,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4117,
                    "endIndex": 4176
                }
            ],
            [
                {
                    "text": "time interval. Another method is the autoregressive integrated",
                    "position": {
                        "top": 0.500987384898989,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4177,
                    "endIndex": 4239
                }
            ],
            [
                {
                    "text": "moving-average (ARIMA) method [6] which is in common",
                    "position": {
                        "top": 0.5160833448863626,
                        "left": 0.511764691486928,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4240,
                    "endIndex": 4292
                }
            ],
            [
                {
                    "text": "use. Non-parameter regression method often uses the data",
                    "position": {
                        "top": 0.5311780417550496,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4293,
                    "endIndex": 4349
                }
            ],
            [
                {
                    "text": "of neighboring locations or neighboring states to estimate",
                    "position": {
                        "top": 0.5462727386237364,
                        "left": 0.511764691486928,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4350,
                    "endIndex": 4408
                }
            ],
            [
                {
                    "text": "the missing data of the current location. The missing data",
                    "position": {
                        "top": 0.5613674354924232,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405234,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4409,
                    "endIndex": 4467
                }
            ],
            [
                {
                    "text": "is estimated by the average or the weighted average of the",
                    "position": {
                        "top": 0.57646213236111,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4468,
                    "endIndex": 4526
                }
            ],
            [
                {
                    "text": "neighboring data. A typical example of this method is k-",
                    "position": {
                        "top": 0.5915568292297969,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4527,
                    "endIndex": 4583
                }
            ],
            [
                {
                    "text": "NN method [7] of which the key work is to determine",
                    "position": {
                        "top": 0.6066527892171706,
                        "left": 0.511764691486928,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4584,
                    "endIndex": 4635
                }
            ],
            [
                {
                    "text": "the neighbors by an appropriate distance metric. Statistical",
                    "position": {
                        "top": 0.6217474860858574,
                        "left": 0.511764691486928,
                        "width": 0.4000016357140524,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4636,
                    "endIndex": 4696
                }
            ],
            [
                {
                    "text": "learning estimation method often uses the observed data",
                    "position": {
                        "top": 0.6368421829545443,
                        "left": 0.511764691486928,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4697,
                    "endIndex": 4752
                }
            ],
            [
                {
                    "text": "to learn a scheme, then inferences the missing data in a",
                    "position": {
                        "top": 0.6519368798232312,
                        "left": 0.511764691486928,
                        "width": 0.4000016357140517,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4753,
                    "endIndex": 4809
                }
            ],
            [
                {
                    "text": "fashion of iteration. A classical method is the Markov Chain",
                    "position": {
                        "top": 0.6670315766919179,
                        "left": 0.511764691486928,
                        "width": 0.4000016357140524,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4810,
                    "endIndex": 4870
                }
            ],
            [
                {
                    "text": "Monte Carlo (MCMC) multiple imputation method [8][9].",
                    "position": {
                        "top": 0.6821262735606048,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4871,
                    "endIndex": 4924
                }
            ],
            [
                {
                    "text": "The basic idea of MCMC multiple imputation method is",
                    "position": {
                        "top": 0.6972222335479786,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405184,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4925,
                    "endIndex": 4977
                }
            ],
            [
                {
                    "text": "to treat the missing data as a parameter of interest, draw a",
                    "position": {
                        "top": 0.7123169304166654,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405173,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4978,
                    "endIndex": 5038
                }
            ],
            [
                {
                    "text": "series of samples of the parameter and estimate the parameter",
                    "position": {
                        "top": 0.7274116272853524,
                        "left": 0.511764691486928,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5039,
                    "endIndex": 5100
                }
            ],
            [
                {
                    "text": "using the samples. That means the imputation of the missing",
                    "position": {
                        "top": 0.7425063241540392,
                        "left": 0.511764691486928,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5101,
                    "endIndex": 5160
                }
            ],
            [
                {
                    "text": "data is a combination of multiple imputed values instead of",
                    "position": {
                        "top": 0.757601021022726,
                        "left": 0.511764691486928,
                        "width": 0.4000016357140518,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5161,
                    "endIndex": 5220
                }
            ],
            [
                {
                    "text": "only one value. Another method is the neural networks [10]",
                    "position": {
                        "top": 0.772695717891413,
                        "left": 0.511764691486928,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5221,
                    "endIndex": 5279
                }
            ],
            [
                {
                    "text": "which is promising to obtain more accurate imputations than",
                    "position": {
                        "top": 0.7877916778787868,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5280,
                    "endIndex": 5339
                }
            ],
            [
                {
                    "text": "traditional imputation methods given more observed data.",
                    "position": {
                        "top": 0.8028863747474736,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5340,
                    "endIndex": 5396
                }
            ],
            [
                {
                    "text": "Due to the complex patterns of traffic data and the diversity",
                    "position": {
                        "top": 0.8179810716161604,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405184,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5397,
                    "endIndex": 5458
                }
            ],
            [
                {
                    "text": "of application scenarios, different methods are being used",
                    "position": {
                        "top": 0.8330757684848473,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5459,
                    "endIndex": 5517
                }
            ],
            [
                {
                    "text": "in the field of traffic data imputation. However, the existing",
                    "position": {
                        "top": 0.8481704653535341,
                        "left": 0.511764691486928,
                        "width": 0.4000016357140519,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5518,
                    "endIndex": 5580
                }
            ],
            [
                {
                    "text": "methods usually treat the missing data separated from the",
                    "position": {
                        "top": 0.8632664253409079,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5581,
                    "endIndex": 5638
                }
            ],
            [
                {
                    "text": "observed data and need extra domain knowledge about the",
                    "position": {
                        "top": 0.878361122209595,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5639,
                    "endIndex": 5694
                }
            ],
            [
                {
                    "text": "specific data and the method. From a new perspective, this",
                    "position": {
                        "top": 0.8934558190782818,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5695,
                    "endIndex": 5753
                }
            ],
            [
                {
                    "text": "paper considers the imputation process as the recovery of",
                    "position": {
                        "top": 0.9085505159469686,
                        "left": 0.511764691486928,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5754,
                    "endIndex": 5811
                }
            ],
            [
                {
                    "text": "data which consists of missing and observed data.",
                    "position": {
                        "top": 0.9236452128156554,
                        "left": 0.511764691486928,
                        "width": 0.3357819363451793,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 5812,
                    "endIndex": 5861
                }
            ],
            [
                {
                    "text": "2014 IEEE 17th International Conference on",
                    "position": {
                        "top": 0.042424242424242455,
                        "left": 0.08823529411764706,
                        "width": 0.2702352941176472,
                        "height": 0.010101010101010102
                    },
                    "startIndex": 5862,
                    "endIndex": 5904
                }
            ],
            [
                {
                    "text": "Intelligent Transportation Systems (ITSC)",
                    "position": {
                        "top": 0.054545454545454605,
                        "left": 0.08823529411764706,
                        "width": 0.2564052287581699,
                        "height": 0.010101010101010102
                    },
                    "startIndex": 5905,
                    "endIndex": 5946
                }
            ],
            [
                {
                    "text": "October 8-11, 2014. Qingdao, China",
                    "position": {
                        "top": 0.06666666666666675,
                        "left": 0.08823529411764706,
                        "width": 0.21939869281045765,
                        "height": 0.010101010101010102
                    },
                    "startIndex": 5947,
                    "endIndex": 5981
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.954040404040404,
                        "left": 0.08823529411764706,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 5982,
                    "endIndex": 5982
                },
                {
                    "text": "978-1-4799-6078-1/14/$31.00 ©2014 IEEE",
                    "position": {
                        "top": 0.954040404040404,
                        "left": 0.08823529411764706,
                        "width": 0.24943790849673214,
                        "height": 0.010101010101010102
                    },
                    "startIndex": 5983,
                    "endIndex": 6021
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.954040404040404,
                        "left": 0.33767320261437916,
                        "width": 0.15142483660130704,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 6022,
                    "endIndex": 6023
                },
                {
                    "text": "912",
                    "position": {
                        "top": 0.954040404040404,
                        "left": 0.48909803921568623,
                        "width": 0.021803921568627455,
                        "height": 0.010101010101010102
                    },
                    "startIndex": 6024,
                    "endIndex": 6027
                }
            ]
        ],
        "page": 1
    },
    {
        "id": "page_2",
        "block_type": "Page",
        "text": "B. Deep Learning  Deep learning has been developing fast since 2006 when deep neural networks constructed of Restricted Boltzmann Machines   (RBMS)   [11]   was   proposed.   A   kind   of   deep learning method trains a multilayer neural network with a small number of nodes in the central layer and reconstructs the input data in the output layer. The training process includes a layer-wise pretraining step and a fine-tuning step instead of training the whole network directly. In the layer- wise pretraining step, each layer is trained in an RBM [11][12] or in an autoencoder [5]. In an RBM shown in Fig. 1, there is a single hidden layer connected with the visible layer and the connection is undirected, symmetrical. While Visible layer  Hidden layer  W   W T  Fig. 1.   The structure of an RBM  in an autoencoder shown in Fig. 2, there is also a single hidden layer apart from an input layer and an output layer. The hidden layer is connected with the input layer and the output layer in a directed, unsymmetrical manner. Usually, the output target is the same with the input thus the hidden layer is a code of the input data and can be decoded into the output data. In a way, an autoencoder is a shallow neural network in which the output target is the input data itself. Whether each layer is trained in an RBM or an autoencoder, Input   layer   Output layer  Hidden layer  W 1   W 2  Fig. 2.   The structure of an autoencoder  the hidden layer is treated as an input layer of the next RBM or autoencoder. Thus the multilayer neural network can be pretrained layer by layer only using the input data. After pretraining, the fine-tuning step adjusts the weights of the whole network using the output data in a supervised learning style. These deep neural networks as introduced above reduce the dimensions of the input data in the central layer and can restore the input data in the output layer. The central layer can be seen as a representation of the input data. Considering the robustness of the representations, DAE was proposed in [4]. DAE aims to be robust to partial destruction of the input data. In a DAE shown in Fig. 3, the input data is the partially destroyed data of the raw input data. The error used in the training process is the difference between the raw input data and the output data. That means DAE can obtain almost the same representation of the destroyed input data and can restore the raw input data in the output layer. In the next section, we will introduce the DSAE based imputation architecture triggered by DAE and constructed by multiple autoencoders. Input   layer   Output layer  Hidden layer  W 1   W 2  Raw input data  Destroyed partially  Error  Fig. 3.   The structure of a DAE  III. IMPUTATION BASED ON DSAE In this section, we first describe the proposed deep learning architecture for traffic data imputation and the corresponding training process, then analyze traffic data imputation patterns that can be realized with the deep learning approach.  A. DSAE based imputation architecture  Traditional traffic data imputation methods often treat the missing data separated from the observed data. This paper treats the traffic data including missing data and observed data as a whole data item and try to restore the complete data from the incomplete data. In Fig. 3 assuming that the complete traffic data as the raw input data exists, the incomplete traffic data can be seen as the partially destroyed raw input data. Therefore DAE can be used for traffic data imputation. The proposed deep learning method for traffic data imputation is based on DSAE. DSAE shown in Fig. 4 can be seen as a DAE filled with multiple autoencoders in the middle. The input of the DSAE based imputation architecture is the traffic data partially destroyed, the output target is the complete traffic data as the raw input data and the central layers are abstract representations of the traffic data. Define traffic data as   X   =   { x ij   | i   = 1 ,   2 , ..., p, j   = 1 ,   2 , ..., q } , the raw input data as   X r   =   { x r ij   | i   = 1 ,   2 , ..., p, j   = 1 ,   2 , ..., q } , the output data as   Y   =   { y ij   | i   = 1 ,   2 , ..., p, j   = 1 ,   2 , ..., q } , where p is the total number of the data items and q is the dimension of one data item. Thus the (input, target) pairs are 913",
        "textItems": [
            [
                {
                    "text": "B. Deep Learning",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.08823529411764706,
                        "width": 0.12189533811764708,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 0,
                    "endIndex": 16
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.09784468132575758,
                        "left": 0.10451470637254902,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 17,
                    "endIndex": 17
                },
                {
                    "text": "Deep learning has been developing fast since 2006 when",
                    "position": {
                        "top": 0.09784468132575758,
                        "left": 0.10451470637254902,
                        "width": 0.38372287795261417,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 18,
                    "endIndex": 72
                }
            ],
            [
                {
                    "text": "deep neural networks constructed of Restricted Boltzmann",
                    "position": {
                        "top": 0.11294064131313136,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 73,
                    "endIndex": 129
                }
            ],
            [
                {
                    "text": "Machines",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.08823529411764706,
                        "width": 0.06329181017647059,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 130,
                    "endIndex": 138
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.15152710429411764,
                        "width": 0.009946320992238564,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 139,
                    "endIndex": 140
                },
                {
                    "text": "(RBMS)",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.16147342528635622,
                        "width": 0.05608032048815359,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 141,
                    "endIndex": 147
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.21755374577450984,
                        "width": 0.009962599749999997,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 148,
                    "endIndex": 149
                },
                {
                    "text": "[11]",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.22751634552450983,
                        "width": 0.027120410430555558,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 150,
                    "endIndex": 154
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.25463675595506535,
                        "width": 0.009946320992238564,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 155,
                    "endIndex": 156
                },
                {
                    "text": "was",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.26458307694730393,
                        "width": 0.02515068074142157,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 157,
                    "endIndex": 160
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.2897337576887255,
                        "width": 0.009946320992238564,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 161,
                    "endIndex": 162
                },
                {
                    "text": "proposed.",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.2996800786809641,
                        "width": 0.06374761539379085,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 163,
                    "endIndex": 172
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.36342769407475484,
                        "width": 0.009962599749999997,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 173,
                    "endIndex": 174
                },
                {
                    "text": "A",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.37339029382475486,
                        "width": 0.01175326310375817,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 175,
                    "endIndex": 176
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.38514355692851304,
                        "width": 0.009946320992238564,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 177,
                    "endIndex": 178
                },
                {
                    "text": "kind",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.3950898779207516,
                        "width": 0.028943631299836604,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 179,
                    "endIndex": 183
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.4240335092205882,
                        "width": 0.009946320992238564,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 184,
                    "endIndex": 185
                },
                {
                    "text": "of",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.43397983021282677,
                        "width": 0.013560205215277779,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 186,
                    "endIndex": 188
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.4475400354281045,
                        "width": 0.009962599749999997,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 189,
                    "endIndex": 190
                },
                {
                    "text": "deep",
                    "position": {
                        "top": 0.1280353381818182,
                        "left": 0.45750263517810447,
                        "width": 0.03073429465359477,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 191,
                    "endIndex": 195
                }
            ],
            [
                {
                    "text": "learning method trains a multilayer neural network with a",
                    "position": {
                        "top": 0.14313003505050503,
                        "left": 0.08823529411764706,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 196,
                    "endIndex": 253
                }
            ],
            [
                {
                    "text": "small number of nodes in the central layer and reconstructs",
                    "position": {
                        "top": 0.15822473191919187,
                        "left": 0.08823529411764706,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 254,
                    "endIndex": 313
                }
            ],
            [
                {
                    "text": "the input data in the output layer. The training process",
                    "position": {
                        "top": 0.17331942878787873,
                        "left": 0.08823529411764706,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 314,
                    "endIndex": 370
                }
            ],
            [
                {
                    "text": "includes a layer-wise pretraining step and a fine-tuning step",
                    "position": {
                        "top": 0.18841412565656557,
                        "left": 0.08823529411764706,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 371,
                    "endIndex": 432
                }
            ],
            [
                {
                    "text": "instead of training the whole network directly. In the layer-",
                    "position": {
                        "top": 0.20351008564393935,
                        "left": 0.08823529411764706,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 433,
                    "endIndex": 494
                }
            ],
            [
                {
                    "text": "wise pretraining step, each layer is trained in an RBM",
                    "position": {
                        "top": 0.2186047825126262,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 495,
                    "endIndex": 549
                }
            ],
            [
                {
                    "text": "[11][12] or in an autoencoder [5]. In an RBM shown in Fig.",
                    "position": {
                        "top": 0.23369947938131302,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 550,
                    "endIndex": 608
                }
            ],
            [
                {
                    "text": "1, there is a single hidden layer connected with the visible",
                    "position": {
                        "top": 0.24879417624999986,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 609,
                    "endIndex": 669
                }
            ],
            [
                {
                    "text": "layer and the connection is undirected, symmetrical. While",
                    "position": {
                        "top": 0.2638888731186867,
                        "left": 0.08823529411764706,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 670,
                    "endIndex": 728
                }
            ],
            [
                {
                    "text": "Visible layer",
                    "position": {
                        "top": 0.39912870269879097,
                        "left": 0.2490406780940491,
                        "width": 0.07780588706760874,
                        "height": 0.011703166306072725
                    },
                    "startIndex": 729,
                    "endIndex": 742
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.3043425957154726,
                        "left": 0.2486230920539275,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 743,
                    "endIndex": 743
                },
                {
                    "text": "Hidden layer",
                    "position": {
                        "top": 0.3043425957154726,
                        "left": 0.2486230920539275,
                        "width": 0.07864135409798749,
                        "height": 0.011703166306072725
                    },
                    "startIndex": 744,
                    "endIndex": 756
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.35173564521542483,
                        "left": 0.25600442026761827,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 757,
                    "endIndex": 757
                },
                {
                    "text": "W",
                    "position": {
                        "top": 0.35173564521542483,
                        "left": 0.25600442026761827,
                        "width": 0.014297138696736378,
                        "height": 0.011703166306072725
                    },
                    "startIndex": 758,
                    "endIndex": 759
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.35173564521542483,
                        "left": 0.2703015589643546,
                        "width": 0.0006341298838053735,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 760,
                    "endIndex": 761
                },
                {
                    "text": "W",
                    "position": {
                        "top": 0.35193628009878225,
                        "left": 0.3005303769644641,
                        "width": 0.014297138696736378,
                        "height": 0.011703166306072725
                    },
                    "startIndex": 762,
                    "endIndex": 763
                },
                {
                    "text": "T",
                    "position": {
                        "top": 0.3466329511910289,
                        "left": 0.3148256836902509,
                        "width": 0.006014184116380931,
                        "height": 0.007606095073536364
                    },
                    "startIndex": 764,
                    "endIndex": 765
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.4376161748737374,
                        "left": 0.1958496741993464,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 766,
                    "endIndex": 766
                },
                {
                    "text": "Fig. 1.",
                    "position": {
                        "top": 0.4376161748737374,
                        "left": 0.1958496741993464,
                        "width": 0.0349538369040523,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 767,
                    "endIndex": 774
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.4376161748737374,
                        "left": 0.23080351110339875,
                        "width": 0.013674191039215702,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 775,
                    "endIndex": 776
                },
                {
                    "text": "The structure of an RBM",
                    "position": {
                        "top": 0.4376161748737374,
                        "left": 0.24447770214261447,
                        "width": 0.1361428505942484,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 777,
                    "endIndex": 800
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.4676098606818182,
                        "left": 0.08823529411764706,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 801,
                    "endIndex": 801
                },
                {
                    "text": "in an autoencoder shown in Fig. 2, there is also a single",
                    "position": {
                        "top": 0.4676098606818182,
                        "left": 0.08823529411764706,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 802,
                    "endIndex": 859
                }
            ],
            [
                {
                    "text": "hidden layer apart from an input layer and an output layer.",
                    "position": {
                        "top": 0.48270455755050506,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 860,
                    "endIndex": 919
                }
            ],
            [
                {
                    "text": "The hidden layer is connected with the input layer and the",
                    "position": {
                        "top": 0.49779925441919187,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 920,
                    "endIndex": 978
                }
            ],
            [
                {
                    "text": "output layer in a directed, unsymmetrical manner. Usually,",
                    "position": {
                        "top": 0.5128939512878787,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 979,
                    "endIndex": 1037
                }
            ],
            [
                {
                    "text": "the output target is the same with the input thus the hidden",
                    "position": {
                        "top": 0.5279899112752524,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1038,
                    "endIndex": 1098
                }
            ],
            [
                {
                    "text": "layer is a code of the input data and can be decoded into",
                    "position": {
                        "top": 0.5430846081439393,
                        "left": 0.08823529411764706,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1099,
                    "endIndex": 1156
                }
            ],
            [
                {
                    "text": "the output data. In a way, an autoencoder is a shallow neural",
                    "position": {
                        "top": 0.5581793050126261,
                        "left": 0.08823529411764706,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1157,
                    "endIndex": 1218
                }
            ],
            [
                {
                    "text": "network in which the output target is the input data itself.",
                    "position": {
                        "top": 0.573274001881313,
                        "left": 0.08823529411764706,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1219,
                    "endIndex": 1279
                }
            ],
            [
                {
                    "text": "Whether each layer is trained in an RBM or an autoencoder,",
                    "position": {
                        "top": 0.5883686987499998,
                        "left": 0.08823529411764706,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1280,
                    "endIndex": 1338
                }
            ],
            [
                {
                    "text": "Input",
                    "position": {
                        "top": 0.7197073961227213,
                        "left": 0.14780605654903106,
                        "width": 0.03090633288037648,
                        "height": 0.011313049490909092
                    },
                    "startIndex": 1339,
                    "endIndex": 1344
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7197073961227213,
                        "left": 0.17871238942940754,
                        "width": 0.00007939086533224379,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1345,
                    "endIndex": 1346
                },
                {
                    "text": "layer",
                    "position": {
                        "top": 0.7197073961227213,
                        "left": 0.18237077766534035,
                        "width": 0.029259865742964658,
                        "height": 0.011313049490909092
                    },
                    "startIndex": 1347,
                    "endIndex": 1352
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7197073961227213,
                        "left": 0.21163064340830504,
                        "width": 0.0032049903084150322,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1353,
                    "endIndex": 1354
                },
                {
                    "text": "Output layer",
                    "position": {
                        "top": 0.7197073961227213,
                        "left": 0.3593189044130918,
                        "width": 0.07358936779237622,
                        "height": 0.011313049490909092
                    },
                    "startIndex": 1355,
                    "endIndex": 1367
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6280809173298444,
                        "left": 0.1417081821548925,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1368,
                    "endIndex": 1368
                },
                {
                    "text": "Hidden layer",
                    "position": {
                        "top": 0.6280809173298444,
                        "left": 0.1417081821548925,
                        "width": 0.07601989988649412,
                        "height": 0.011313049490909092
                    },
                    "startIndex": 1369,
                    "endIndex": 1381
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6738941528676367,
                        "left": 0.15560852985423562,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1382,
                    "endIndex": 1382
                },
                {
                    "text": "W",
                    "position": {
                        "top": 0.6738941528676367,
                        "left": 0.15560852985423562,
                        "width": 0.01382055363689412,
                        "height": 0.011313049490909092
                    },
                    "startIndex": 1383,
                    "endIndex": 1384
                },
                {
                    "text": "1",
                    "position": {
                        "top": 0.6755127688409445,
                        "left": 0.16942730859280916,
                        "width": 0.00475753315882353,
                        "height": 0.007352551245454546
                    },
                    "startIndex": 1385,
                    "endIndex": 1386
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.6755127688409445,
                        "left": 0.17418484175163268,
                        "width": 0.0039390812132352945,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1387,
                    "endIndex": 1388
                },
                {
                    "text": "W",
                    "position": {
                        "top": 0.6750392211186445,
                        "left": 0.35570054019598857,
                        "width": 0.01382055363689412,
                        "height": 0.011313049490909092
                    },
                    "startIndex": 1389,
                    "endIndex": 1390
                },
                {
                    "text": "2",
                    "position": {
                        "top": 0.6766578371000332,
                        "left": 0.36952559408620456,
                        "width": 0.00475753315882353,
                        "height": 0.007352551245454546
                    },
                    "startIndex": 1391,
                    "endIndex": 1392
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.757665402979798,
                        "left": 0.17850327336601307,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1393,
                    "endIndex": 1393
                },
                {
                    "text": "Fig. 2.",
                    "position": {
                        "top": 0.757665402979798,
                        "left": 0.17850327336601307,
                        "width": 0.03495383690405228,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1394,
                    "endIndex": 1401
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.757665402979798,
                        "left": 0.2134571102700654,
                        "width": 0.013674191039215702,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1402,
                    "endIndex": 1403
                },
                {
                    "text": "The structure of an autoencoder",
                    "position": {
                        "top": 0.757665402979798,
                        "left": 0.2271313013092811,
                        "width": 0.1708362267166014,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1404,
                    "endIndex": 1435
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.7876603531060605,
                        "left": 0.088235300375817,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1436,
                    "endIndex": 1436
                },
                {
                    "text": "the hidden layer is treated as an input layer of the next RBM",
                    "position": {
                        "top": 0.7876603531060605,
                        "left": 0.088235300375817,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1437,
                    "endIndex": 1498
                }
            ],
            [
                {
                    "text": "or autoencoder. Thus the multilayer neural network can be",
                    "position": {
                        "top": 0.8027550499747476,
                        "left": 0.088235300375817,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1499,
                    "endIndex": 1556
                }
            ],
            [
                {
                    "text": "pretrained layer by layer only using the input data. After",
                    "position": {
                        "top": 0.8178497468434344,
                        "left": 0.088235300375817,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1557,
                    "endIndex": 1615
                }
            ],
            [
                {
                    "text": "pretraining, the fine-tuning step adjusts the weights of the",
                    "position": {
                        "top": 0.8329444437121212,
                        "left": 0.088235300375817,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1616,
                    "endIndex": 1676
                }
            ],
            [
                {
                    "text": "whole network using the output data in a supervised learning",
                    "position": {
                        "top": 0.8480391405808082,
                        "left": 0.088235300375817,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1677,
                    "endIndex": 1737
                }
            ],
            [
                {
                    "text": "style.",
                    "position": {
                        "top": 0.8631351005681819,
                        "left": 0.088235300375817,
                        "width": 0.03482026285171569,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1738,
                    "endIndex": 1744
                }
            ],
            [
                {
                    "text": "These deep neural networks as introduced above reduce",
                    "position": {
                        "top": 0.8783598475378789,
                        "left": 0.10451471263071896,
                        "width": 0.383722877952614,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1745,
                    "endIndex": 1798
                }
            ],
            [
                {
                    "text": "the dimensions of the input data in the central layer and can",
                    "position": {
                        "top": 0.8934545444065657,
                        "left": 0.088235300375817,
                        "width": 0.4000016357140519,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1799,
                    "endIndex": 1860
                }
            ],
            [
                {
                    "text": "restore the input data in the output layer. The central layer",
                    "position": {
                        "top": 0.9085505043939395,
                        "left": 0.088235300375817,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1861,
                    "endIndex": 1922
                }
            ],
            [
                {
                    "text": "can be seen as a representation of the input data. Considering",
                    "position": {
                        "top": 0.9236452012626263,
                        "left": 0.088235300375817,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1923,
                    "endIndex": 1985
                }
            ],
            [
                {
                    "text": "the robustness of the representations, DAE was proposed in",
                    "position": {
                        "top": 0.07832955704545459,
                        "left": 0.5117647320751635,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1986,
                    "endIndex": 2044
                }
            ],
            [
                {
                    "text": "[4]. DAE aims to be robust to partial destruction of the",
                    "position": {
                        "top": 0.09342551703282838,
                        "left": 0.5117647320751635,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2045,
                    "endIndex": 2101
                }
            ],
            [
                {
                    "text": "input data. In a DAE shown in Fig. 3, the input data is",
                    "position": {
                        "top": 0.10852021390151521,
                        "left": 0.5117647320751635,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2102,
                    "endIndex": 2157
                }
            ],
            [
                {
                    "text": "the partially destroyed data of the raw input data. The error",
                    "position": {
                        "top": 0.12361491077020206,
                        "left": 0.5117647320751635,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2158,
                    "endIndex": 2219
                }
            ],
            [
                {
                    "text": "used in the training process is the difference between the raw",
                    "position": {
                        "top": 0.1387096076388889,
                        "left": 0.5117647320751635,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2220,
                    "endIndex": 2282
                }
            ],
            [
                {
                    "text": "input data and the output data. That means DAE can obtain",
                    "position": {
                        "top": 0.15380430450757573,
                        "left": 0.5117647320751635,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2283,
                    "endIndex": 2340
                }
            ],
            [
                {
                    "text": "almost the same representation of the destroyed input data",
                    "position": {
                        "top": 0.16889900137626257,
                        "left": 0.5117647320751635,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2341,
                    "endIndex": 2399
                }
            ],
            [
                {
                    "text": "and can restore the raw input data in the output layer. In the",
                    "position": {
                        "top": 0.18399496136363636,
                        "left": 0.5117647320751635,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2400,
                    "endIndex": 2462
                }
            ],
            [
                {
                    "text": "next section, we will introduce the DSAE based imputation",
                    "position": {
                        "top": 0.1990896582323232,
                        "left": 0.5117647320751635,
                        "width": 0.4000016357140524,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2463,
                    "endIndex": 2520
                }
            ],
            [
                {
                    "text": "architecture triggered by DAE and constructed by multiple",
                    "position": {
                        "top": 0.21418435510101005,
                        "left": 0.5117647320751635,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2521,
                    "endIndex": 2578
                }
            ],
            [
                {
                    "text": "autoencoders.",
                    "position": {
                        "top": 0.2292790519696969,
                        "left": 0.5117647320751635,
                        "width": 0.08995641538970589,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2579,
                    "endIndex": 2592
                }
            ],
            [
                {
                    "text": "Input",
                    "position": {
                        "top": 0.3560407336293082,
                        "left": 0.5761263519789771,
                        "width": 0.030432605114513546,
                        "height": 0.011139644717163636
                    },
                    "startIndex": 2593,
                    "endIndex": 2598
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3560407336293082,
                        "left": 0.6065589570934908,
                        "width": 0.00007939095225126922,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2599,
                    "endIndex": 2600
                },
                {
                    "text": "layer",
                    "position": {
                        "top": 0.3560407336293082,
                        "left": 0.6101612740316438,
                        "width": 0.028811374785415393,
                        "height": 0.011139644717163636
                    },
                    "startIndex": 2601,
                    "endIndex": 2606
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3560407336293082,
                        "left": 0.6389726488170592,
                        "width": 0.0032050129899691368,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2607,
                    "endIndex": 2608
                },
                {
                    "text": "Output layer",
                    "position": {
                        "top": 0.3560407336293082,
                        "left": 0.7843981948443335,
                        "width": 0.07246140068833759,
                        "height": 0.011139644717163636
                    },
                    "startIndex": 2609,
                    "endIndex": 2621
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.26581550651178804,
                        "left": 0.5701219449250979,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2622,
                    "endIndex": 2622
                },
                {
                    "text": "Hidden layer",
                    "position": {
                        "top": 0.26581550651178804,
                        "left": 0.5701219449250979,
                        "width": 0.07485467794076076,
                        "height": 0.011139644717163636
                    },
                    "startIndex": 2623,
                    "endIndex": 2635
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.31092414370734867,
                        "left": 0.5838092301311469,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2636,
                    "endIndex": 2636
                },
                {
                    "text": "W",
                    "position": {
                        "top": 0.31092414370734867,
                        "left": 0.5838092301311469,
                        "width": 0.013608714205062026,
                        "height": 0.011139644717163636
                    },
                    "startIndex": 2637,
                    "endIndex": 2638
                },
                {
                    "text": "1",
                    "position": {
                        "top": 0.3125235106097526,
                        "left": 0.5974161966432712,
                        "width": 0.004684610383964707,
                        "height": 0.00723985241158182
                    },
                    "startIndex": 2639,
                    "endIndex": 2640
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3125235106097526,
                        "left": 0.6021008070272359,
                        "width": 0.003939103981254537,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2641,
                    "endIndex": 2642
                },
                {
                    "text": "W",
                    "position": {
                        "top": 0.31205404633542433,
                        "left": 0.7808352923865814,
                        "width": 0.013608714205062026,
                        "height": 0.011139644717163636
                    },
                    "startIndex": 2643,
                    "endIndex": 2644
                },
                {
                    "text": "2",
                    "position": {
                        "top": 0.3136454605273436,
                        "left": 0.7944484378657384,
                        "width": 0.004684610383964707,
                        "height": 0.00723985241158182
                    },
                    "startIndex": 2645,
                    "endIndex": 2646
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.43518494174718436,
                        "left": 0.5639105640898365,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2647,
                    "endIndex": 2647
                },
                {
                    "text": "Raw input data",
                    "position": {
                        "top": 0.43518494174718436,
                        "left": 0.5639105640898365,
                        "width": 0.08728102421371152,
                        "height": 0.011139644717163636
                    },
                    "startIndex": 2648,
                    "endIndex": 2662
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.3901566753685759,
                        "left": 0.5443573721857745,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2663,
                    "endIndex": 2663
                },
                {
                    "text": "Destroyed",
                    "position": {
                        "top": 0.3901566753685759,
                        "left": 0.5443573721857745,
                        "width": 0.059248662656783385,
                        "height": 0.011139644717163636
                    },
                    "startIndex": 2664,
                    "endIndex": 2673
                }
            ],
            [
                {
                    "text": "partially",
                    "position": {
                        "top": 0.4035245509363586,
                        "left": 0.549963783923817,
                        "width": 0.048035773195049446,
                        "height": 0.011139644717163636
                    },
                    "startIndex": 2674,
                    "endIndex": 2683
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.43405662966597985,
                        "left": 0.8054254393513296,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2684,
                    "endIndex": 2684
                },
                {
                    "text": "Error",
                    "position": {
                        "top": 0.43405662966597985,
                        "left": 0.8054254393513296,
                        "width": 0.030415789895156503,
                        "height": 0.011139644717163636
                    },
                    "startIndex": 2685,
                    "endIndex": 2690
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.47313381929292925,
                        "left": 0.6239901773039216,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2691,
                    "endIndex": 2691
                },
                {
                    "text": "Fig. 3.",
                    "position": {
                        "top": 0.47313381929292925,
                        "left": 0.6239901773039216,
                        "width": 0.0349538369040523,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2692,
                    "endIndex": 2699
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.47313381929292925,
                        "left": 0.6589440142079739,
                        "width": 0.013674191039215655,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2700,
                    "endIndex": 2701
                },
                {
                    "text": "The structure of a DAE",
                    "position": {
                        "top": 0.47313381929292925,
                        "left": 0.6726182052471895,
                        "width": 0.1269225389220916,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2702,
                    "endIndex": 2724
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5141666489646465,
                        "left": 0.5732810263235294,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2725,
                    "endIndex": 2725
                },
                {
                    "text": "III. IMPUTATION BASED ON DSAE",
                    "position": {
                        "top": 0.5141666489646465,
                        "left": 0.5732810263235294,
                        "width": 0.2769667845531053,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2726,
                    "endIndex": 2755
                }
            ],
            [
                {
                    "text": "In this section, we first describe the proposed deep learning",
                    "position": {
                        "top": 0.5334115979671717,
                        "left": 0.5280440991013071,
                        "width": 0.3837228779526139,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2756,
                    "endIndex": 2817
                }
            ],
            [
                {
                    "text": "architecture for traffic data imputation and the corresponding",
                    "position": {
                        "top": 0.5485075579545454,
                        "left": 0.5117646868464053,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2818,
                    "endIndex": 2880
                }
            ],
            [
                {
                    "text": "training process, then analyze traffic data imputation patterns",
                    "position": {
                        "top": 0.5636022548232322,
                        "left": 0.5117646868464053,
                        "width": 0.4000016357140519,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2881,
                    "endIndex": 2944
                }
            ],
            [
                {
                    "text": "that can be realized with the deep learning approach.",
                    "position": {
                        "top": 0.578696951691919,
                        "left": 0.5117646868464053,
                        "width": 0.3561303835469766,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2945,
                    "endIndex": 2998
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6025492253409089,
                        "left": 0.5117646868464053,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2999,
                    "endIndex": 2999
                },
                {
                    "text": "A. DSAE based imputation architecture",
                    "position": {
                        "top": 0.6025492253409089,
                        "left": 0.5117646868464053,
                        "width": 0.26568560542442793,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3000,
                    "endIndex": 3037
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6217158923863635,
                        "left": 0.5280440991013071,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3038,
                    "endIndex": 3038
                },
                {
                    "text": "Traditional traffic data imputation methods often treat the",
                    "position": {
                        "top": 0.6217158923863635,
                        "left": 0.5280440991013071,
                        "width": 0.38372287795261445,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3039,
                    "endIndex": 3098
                }
            ],
            [
                {
                    "text": "missing data separated from the observed data. This paper",
                    "position": {
                        "top": 0.6368105892550504,
                        "left": 0.5117646868464053,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3099,
                    "endIndex": 3156
                }
            ],
            [
                {
                    "text": "treats the traffic data including missing data and observed",
                    "position": {
                        "top": 0.6519052861237373,
                        "left": 0.5117646868464053,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3157,
                    "endIndex": 3216
                }
            ],
            [
                {
                    "text": "data as a whole data item and try to restore the complete",
                    "position": {
                        "top": 0.666999982992424,
                        "left": 0.5117646868464053,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3217,
                    "endIndex": 3274
                }
            ],
            [
                {
                    "text": "data from the incomplete data. In Fig. 3 assuming that",
                    "position": {
                        "top": 0.6820946798611109,
                        "left": 0.5117646868464053,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3275,
                    "endIndex": 3329
                }
            ],
            [
                {
                    "text": "the complete traffic data as the raw input data exists, the",
                    "position": {
                        "top": 0.6971906398484847,
                        "left": 0.5117646868464053,
                        "width": 0.4000016357140519,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3330,
                    "endIndex": 3389
                }
            ],
            [
                {
                    "text": "incomplete traffic data can be seen as the partially destroyed",
                    "position": {
                        "top": 0.7122853367171715,
                        "left": 0.5117646868464053,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3390,
                    "endIndex": 3452
                }
            ],
            [
                {
                    "text": "raw input data. Therefore DAE can be used for traffic data",
                    "position": {
                        "top": 0.7273800335858585,
                        "left": 0.5117646868464053,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3453,
                    "endIndex": 3511
                }
            ],
            [
                {
                    "text": "imputation. The proposed deep learning method for traffic",
                    "position": {
                        "top": 0.7424747304545453,
                        "left": 0.5117646868464053,
                        "width": 0.4000016357140519,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3512,
                    "endIndex": 3569
                }
            ],
            [
                {
                    "text": "data imputation is based on DSAE. DSAE shown in Fig. 4",
                    "position": {
                        "top": 0.7575694273232321,
                        "left": 0.5117646868464053,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3570,
                    "endIndex": 3624
                }
            ],
            [
                {
                    "text": "can be seen as a DAE filled with multiple autoencoders in",
                    "position": {
                        "top": 0.7726641241919191,
                        "left": 0.5117646868464053,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3625,
                    "endIndex": 3682
                }
            ],
            [
                {
                    "text": "the middle.",
                    "position": {
                        "top": 0.7877600841792929,
                        "left": 0.5117646868464053,
                        "width": 0.07488228570261435,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3683,
                    "endIndex": 3694
                }
            ],
            [
                {
                    "text": "The input of the DSAE based imputation architecture is",
                    "position": {
                        "top": 0.8028863462121212,
                        "left": 0.5280440991013071,
                        "width": 0.38372287795261445,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3695,
                    "endIndex": 3749
                }
            ],
            [
                {
                    "text": "the traffic data partially destroyed, the output target is the",
                    "position": {
                        "top": 0.817981043080808,
                        "left": 0.5117646868464053,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3750,
                    "endIndex": 3812
                }
            ],
            [
                {
                    "text": "complete traffic data as the raw input data and the central",
                    "position": {
                        "top": 0.8330757399494948,
                        "left": 0.5117646868464053,
                        "width": 0.4000016357140519,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3813,
                    "endIndex": 3872
                }
            ],
            [
                {
                    "text": "layers are abstract representations of the traffic data. Define",
                    "position": {
                        "top": 0.8481704368181816,
                        "left": 0.5117646868464053,
                        "width": 0.4000016357140519,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3873,
                    "endIndex": 3936
                }
            ],
            [
                {
                    "text": "traffic data as",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.5117646868464053,
                        "width": 0.09226799899183008,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3937,
                    "endIndex": 3952
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.6040326858382352,
                        "width": 0.006558795828431483,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3953,
                    "endIndex": 3954
                },
                {
                    "text": "X",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.6105914816666667,
                        "width": 0.01348695080535131,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3955,
                    "endIndex": 3956
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.6240784324720179,
                        "width": 0.0073954016946487025,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3957,
                    "endIndex": 3958
                },
                {
                    "text": "=",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.6314738341666666,
                        "width": 0.012661617786846404,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3959,
                    "endIndex": 3960
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.6441354519535131,
                        "width": 0.006119428651062134,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3961,
                    "endIndex": 3962
                },
                {
                    "text": "{",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.6502548806045751,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3963,
                    "endIndex": 3964
                },
                {
                    "text": "x",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.6583937693954248,
                        "width": 0.009303310060661764,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3965,
                    "endIndex": 3966
                },
                {
                    "text": "ij",
                    "position": {
                        "top": 0.8651527599494949,
                        "left": 0.6676976905555555,
                        "width": 0.009992361714171569,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 3967,
                    "endIndex": 3969
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8651527599494949,
                        "left": 0.6776900522697271,
                        "width": 0.0014733248871356091,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3970,
                    "endIndex": 3971
                },
                {
                    "text": "|",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.6791633771568627,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3972,
                    "endIndex": 3973
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.6836846189052287,
                        "width": 0.0056080320488153595,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3974,
                    "endIndex": 3975
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.6892926509540441,
                        "width": 0.006119092199550649,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3976,
                    "endIndex": 3977
                },
                {
                    "text": "= 1",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.6954117431535948,
                        "width": 0.02692180958586604,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3978,
                    "endIndex": 3981
                },
                {
                    "text": ",",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.7223316784150327,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3982,
                    "endIndex": 3983
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.7268539173211601,
                        "width": 0.002713055162499951,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3984,
                    "endIndex": 3985
                },
                {
                    "text": "2",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.72956697248366,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3986,
                    "endIndex": 3987
                },
                {
                    "text": ", ..., p, j",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.7377058612745097,
                        "width": 0.050166247793423276,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3988,
                    "endIndex": 3999
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.787872109067933,
                        "width": 0.007049436585661674,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4000,
                    "endIndex": 4001
                },
                {
                    "text": "= 1",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.7949215456535947,
                        "width": 0.02692180958586604,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4002,
                    "endIndex": 4005
                },
                {
                    "text": ",",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.8218414809150326,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4006,
                    "endIndex": 4007
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.8263637198211601,
                        "width": 0.002713055162499951,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4008,
                    "endIndex": 4009
                },
                {
                    "text": "2",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.82907677498366,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4010,
                    "endIndex": 4011
                },
                {
                    "text": ", ..., q",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.8372156637745095,
                        "width": 0.03529885832990183,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4012,
                    "endIndex": 4020
                },
                {
                    "text": "}",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.8731029175816991,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4021,
                    "endIndex": 4022
                },
                {
                    "text": ", the",
                    "position": {
                        "top": 0.8632651336868685,
                        "left": 0.8812418063725487,
                        "width": 0.030522670802696165,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4023,
                    "endIndex": 4028
                }
            ],
            [
                {
                    "text": "raw input data as",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.5117646901960782,
                        "width": 0.1167024143917484,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4029,
                    "endIndex": 4046
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.6284671045878265,
                        "width": 0.0061309248239379095,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4047,
                    "endIndex": 4048
                },
                {
                    "text": "X",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.6345980294117644,
                        "width": 0.01348695080535131,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4049,
                    "endIndex": 4050
                },
                {
                    "text": "r",
                    "position": {
                        "top": 0.8737954366161615,
                        "left": 0.6493611010294115,
                        "width": 0.006043960147333333,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 4051,
                    "endIndex": 4052
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8737954366161615,
                        "left": 0.6554050611767448,
                        "width": 0.006490353578156892,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4053,
                    "endIndex": 4054
                },
                {
                    "text": "=",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.6618954147549017,
                        "width": 0.012661617786846404,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4055,
                    "endIndex": 4056
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.674557032541748,
                        "width": 0.005325310905964034,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4057,
                    "endIndex": 4058
                },
                {
                    "text": "{",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.679882343447712,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4059,
                    "endIndex": 4060
                },
                {
                    "text": "x",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.6880212322385617,
                        "width": 0.009303310060661764,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4061,
                    "endIndex": 4062
                },
                {
                    "text": "r",
                    "position": {
                        "top": 0.8737954366161615,
                        "left": 0.6973251533986925,
                        "width": 0.006043960147333333,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 4063,
                    "endIndex": 4064
                }
            ],
            [
                {
                    "text": "ij",
                    "position": {
                        "top": 0.8816350832070706,
                        "left": 0.6973251533986925,
                        "width": 0.009992361714171569,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 4065,
                    "endIndex": 4067
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8816350832070706,
                        "left": 0.707317515112864,
                        "width": 0.0014733248871356091,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4068,
                    "endIndex": 4069
                },
                {
                    "text": "|",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.7087908399999996,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4070,
                    "endIndex": 4071
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.7133120817483657,
                        "width": 0.0056080320488153595,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4072,
                    "endIndex": 4073
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.718920113797181,
                        "width": 0.005324974438112759,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4074,
                    "endIndex": 4075
                },
                {
                    "text": "= 1",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.7242450882352938,
                        "width": 0.026124150455555543,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4076,
                    "endIndex": 4079
                },
                {
                    "text": ",",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.7503725388398689,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4080,
                    "endIndex": 4081
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.7548947777459963,
                        "width": 0.0027114212899509676,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4082,
                    "endIndex": 4083
                },
                {
                    "text": "2",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.7576061990359474,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4084,
                    "endIndex": 4085
                },
                {
                    "text": ", ..., p, j",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.765746721699346,
                        "width": 0.050166247793423276,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4086,
                    "endIndex": 4097
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.8159129694927694,
                        "width": 0.006255318807883901,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4098,
                    "endIndex": 4099
                },
                {
                    "text": "= 1",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.8221682883006532,
                        "width": 0.026124150455555637,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4100,
                    "endIndex": 4103
                },
                {
                    "text": ",",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.848294105816993,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4104,
                    "endIndex": 4105
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.8528163447231205,
                        "width": 0.0027130551625000436,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4106,
                    "endIndex": 4107
                },
                {
                    "text": "2",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.8555293998856205,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4108,
                    "endIndex": 4109
                },
                {
                    "text": ", ..., q",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.86366828867647,
                        "width": 0.03529885832990183,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4110,
                    "endIndex": 4118
                },
                {
                    "text": "}",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.8995555424836597,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4119,
                    "endIndex": 4120
                },
                {
                    "text": ",",
                    "position": {
                        "top": 0.8783598305555554,
                        "left": 0.9076944312745092,
                        "width": 0.004069689440359478,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4121,
                    "endIndex": 4122
                }
            ],
            [
                {
                    "text": "the output data as",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.5117646833660126,
                        "width": 0.12183022308660127,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4123,
                    "endIndex": 4141
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.6335949064526138,
                        "width": 0.006558661717320351,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4142,
                    "endIndex": 4143
                },
                {
                    "text": "Y",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.6401535681699342,
                        "width": 0.00945144675629085,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4144,
                    "endIndex": 4145
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.649605014926225,
                        "width": 0.009720121544362787,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4146,
                    "endIndex": 4147
                },
                {
                    "text": "=",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.6593251364705878,
                        "width": 0.012661617786846404,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4148,
                    "endIndex": 4149
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.6719867542574341,
                        "width": 0.006104721510539258,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4150,
                    "endIndex": 4151
                },
                {
                    "text": "{",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.6780914757679735,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4152,
                    "endIndex": 4153
                },
                {
                    "text": "y",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.6862303645588231,
                        "width": 0.007981474930433007,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4154,
                    "endIndex": 4155
                },
                {
                    "text": "ij",
                    "position": {
                        "top": 0.8953421541161616,
                        "left": 0.6942107564052283,
                        "width": 0.009992361714171569,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 4156,
                    "endIndex": 4158
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8953421541161616,
                        "left": 0.7042031181193998,
                        "width": 0.0014733248871356091,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4159,
                    "endIndex": 4160
                },
                {
                    "text": "|",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.7056764430065354,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4161,
                    "endIndex": 4162
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.7101976847549015,
                        "width": 0.0056080320488153595,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4163,
                    "endIndex": 4164
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.7158057168037169,
                        "width": 0.006104386594975497,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4165,
                    "endIndex": 4166
                },
                {
                    "text": "= 1",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.7219101033986923,
                        "width": 0.02690553082810461,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4167,
                    "endIndex": 4170
                },
                {
                    "text": ",",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.7488153315032675,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4171,
                    "endIndex": 4172
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.753337570409395,
                        "width": 0.002713055162499951,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4173,
                    "endIndex": 4174
                },
                {
                    "text": "2",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.7560506255718948,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4175,
                    "endIndex": 4176
                },
                {
                    "text": ", ..., p, j",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.7641895143627445,
                        "width": 0.050166247793423276,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4177,
                    "endIndex": 4188
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.8143557621561679,
                        "width": 0.007034732533374034,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4189,
                    "endIndex": 4190
                },
                {
                    "text": "= 1",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.821390494689542,
                        "width": 0.026905530828104516,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4191,
                    "endIndex": 4194
                },
                {
                    "text": ",",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.8482940897058818,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4195,
                    "endIndex": 4196
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.8528163286120092,
                        "width": 0.0027130551625000436,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4197,
                    "endIndex": 4198
                },
                {
                    "text": "2",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.8555293837745093,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4199,
                    "endIndex": 4200
                },
                {
                    "text": ", ..., q",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.8636682725653588,
                        "width": 0.03529885832990183,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4201,
                    "endIndex": 4209
                },
                {
                    "text": "}",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.8995555263725484,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4210,
                    "endIndex": 4211
                },
                {
                    "text": ",",
                    "position": {
                        "top": 0.8934557905429292,
                        "left": 0.907694415163398,
                        "width": 0.004069689440359478,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4212,
                    "endIndex": 4213
                }
            ],
            [
                {
                    "text": "where p is the total number of the data items and q is the",
                    "position": {
                        "top": 0.9085504874116161,
                        "left": 0.5117646672549013,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4214,
                    "endIndex": 4272
                }
            ],
            [
                {
                    "text": "dimension of one data item. Thus the (input, target) pairs are",
                    "position": {
                        "top": 0.923645184280303,
                        "left": 0.5117646672549013,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4273,
                    "endIndex": 4335
                }
            ],
            [
                {
                    "text": "913",
                    "position": {
                        "top": 0.954040404040404,
                        "left": 0.48909803921568623,
                        "width": 0.021803921568627455,
                        "height": 0.010101010101010102
                    },
                    "startIndex": 4336,
                    "endIndex": 4339
                }
            ]
        ],
        "page": 2
    },
    {
        "id": "page_3",
        "block_type": "Page",
        "text": "{ ( x i , y i ) | i   = 1 ,   2 , ..., p } . The recovery error for the whole imputation architecture is denoted as   L .  B. Training process  The training process of the deep architecture proposed above includes the pre-training step and the fine-training step. In the pre-training step, each layer is trained by minimizing the reconstruction error   L ( X, Y   )   of the current autoencoder. Assuming the parameters are   θ , then  θ   = arg min  θ   L ( X, Y   ) = arg min  θ  1 2  p ∑  i =1  ‖ ( x i   −   y i ) ‖ 2 ,  where   θ   includes the weights and biases of the current autoencoder,   X, Y   is the input and the output of the current autoencoder. The hidden layer of the current autoencoder is the input layer of the next autoencoder. Thus the deep architecture can be pre-trained layer by layer. After pre- training,   fine-tune   all   the   parameters   by   minimizing   the recovery error, then  θ   = arg min  θ   L ( X r   , Y   ) = arg min  θ  1 2  p ∑  i =1  ‖ ( x r i   −   y i ) ‖ 2 .  Until now, the deep architecture has been trained completely. The above training process is based on an assumption that the meta parameters such as the number of layers and the number of nodes in each layer have been set. In practise, we usually choose the proper meta parameters through experiences and experiments. Input   layer  Hidden layer  W 1  Raw input data  Destroyed partially  Error  Hidden layer  W 2  Hidden layer  W l  Ouput   layer  W l+1  Raw input data  Fig. 4.   The DSAE based imputation architecture  C. Imputation Patterns  In this paper, we focus on the imputation process of traffic data assuming all missing data have been recognized. In real world, the range of traffic data can be very wide including data from detectors and data from surveys. In terms of traffic data from detectors deployed in different locations, the proposed deep learning based imputation approach can use the data in different patterns. Traffic data from detectors naturally has a period (or cycle) of one day or one week. Assuming the obtained data are collected in   N   even time intervals during every period and contain   D   periods and   M  locations, then the domain of the traffic data can be described as a cube in Fig. 5. … …  Fig. 5.   The traffic data cube  According to the data structures adopted, there are various imputation patterns of the proposed approach. The simplest data structure is that one data item contains data of one period, single location thus the imputation process can be seen as a line recovery in the perspective of data cube. While the most complex data structure is that one data item contains data of multiple periods, multiple locations thus the impu- tation process can be seen as a 3-D recovery. All possible imputation patterns are listed in Table I. The proposed deep learning based imputation approach can be applied to realize any of these patterns according to actual demand without too much work of selecting features artificially.  TABLE I I MPUTATION   P ATTERNS  Period   Location   Pattern 1   Single   Single   1-D 2   Single   Multiple   2-D 3   Multiple   Single   2-D 4   Multiple   Multiple   3-D  IV. EXPERIMENTS AND RESULTS  A. Data description  The proposed deep learning based approach for traffic data imputation is experimented on the data set collected from the Caltrans Performance Measurement System (PeMS). The 914",
        "textItems": [
            [
                {
                    "text": "{",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.08823529411764706,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 0,
                    "endIndex": 1
                },
                {
                    "text": "(",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.09637418290849674,
                        "width": 0.006330808893423202,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2,
                    "endIndex": 3
                },
                {
                    "text": "x",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.10270588225490197,
                        "width": 0.009303310060661764,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 4,
                    "endIndex": 5
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.08021715568181814,
                        "left": 0.1120098034150327,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 6,
                    "endIndex": 7
                },
                {
                    "text": ", y",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.11742810401960785,
                        "width": 0.01522226638272059,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 8,
                    "endIndex": 11
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.08021715568181814,
                        "left": 0.1326454238235294,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 12,
                    "endIndex": 13
                },
                {
                    "text": ")",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.13806535830065358,
                        "width": 0.006330808893423202,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 14,
                    "endIndex": 15
                },
                {
                    "text": "|",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.14439542377450978,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 16,
                    "endIndex": 17
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.1489166655228758,
                        "width": 0.0056080320488153595,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 18,
                    "endIndex": 19
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.15452469757169116,
                        "width": 0.007158308147263082,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 20,
                    "endIndex": 21
                },
                {
                    "text": "= 1",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.16168300571895422,
                        "width": 0.027963650082598036,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 22,
                    "endIndex": 25
                },
                {
                    "text": ",",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.18964215612745097,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 26,
                    "endIndex": 27
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.19416439503357844,
                        "width": 0.002713055162499997,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 28,
                    "endIndex": 29
                },
                {
                    "text": "2",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.1968774501960784,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 30,
                    "endIndex": 31
                },
                {
                    "text": ", ..., p",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.2050163389869281,
                        "width": 0.03622186389497545,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 32,
                    "endIndex": 40
                },
                {
                    "text": "}",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.24124346236928104,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 41,
                    "endIndex": 42
                },
                {
                    "text": ". The recovery error for the whole",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.24938235116013072,
                        "width": 0.2388582126335784,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 43,
                    "endIndex": 77
                }
            ],
            [
                {
                    "text": "imputation architecture is denoted as",
                    "position": {
                        "top": 0.09342548940656566,
                        "left": 0.08823528967320261,
                        "width": 0.2461348173529412,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 78,
                    "endIndex": 115
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.09342548940656566,
                        "left": 0.3343701070261437,
                        "width": 0.005695240000000087,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 116,
                    "endIndex": 117
                },
                {
                    "text": "L",
                    "position": {
                        "top": 0.09342548940656566,
                        "left": 0.3400653470261438,
                        "width": 0.01107932253243464,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 118,
                    "endIndex": 119
                },
                {
                    "text": ".",
                    "position": {
                        "top": 0.09342548940656566,
                        "left": 0.35114541258169935,
                        "width": 0.004069689440359478,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 120,
                    "endIndex": 121
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.1292247326388889,
                        "left": 0.08823528027777776,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 122,
                    "endIndex": 122
                },
                {
                    "text": "B. Training process",
                    "position": {
                        "top": 0.1292247326388889,
                        "left": 0.08823528027777776,
                        "width": 0.1327044332712418,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 123,
                    "endIndex": 142
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.15331059148989895,
                        "left": 0.10451469253267971,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 143,
                    "endIndex": 143
                },
                {
                    "text": "The training process of the deep architecture proposed",
                    "position": {
                        "top": 0.15331059148989895,
                        "left": 0.10451469253267971,
                        "width": 0.3837228779526141,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 144,
                    "endIndex": 198
                }
            ],
            [
                {
                    "text": "above includes the pre-training step and the fine-training step.",
                    "position": {
                        "top": 0.1684052883585858,
                        "left": 0.08823528027777776,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 199,
                    "endIndex": 263
                }
            ],
            [
                {
                    "text": "In the pre-training step, each layer is trained by minimizing",
                    "position": {
                        "top": 0.18349998522727262,
                        "left": 0.08823528027777776,
                        "width": 0.4000016357140519,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 264,
                    "endIndex": 325
                }
            ],
            [
                {
                    "text": "the reconstruction error",
                    "position": {
                        "top": 0.1985959452146464,
                        "left": 0.08823528027777776,
                        "width": 0.15469703500694448,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 326,
                    "endIndex": 350
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.1985959452146464,
                        "left": 0.24293231528472223,
                        "width": 0.005025187215277759,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 351,
                    "endIndex": 352
                },
                {
                    "text": "L",
                    "position": {
                        "top": 0.1985959452146464,
                        "left": 0.24795750249999998,
                        "width": 0.01107932253243464,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 353,
                    "endIndex": 354
                },
                {
                    "text": "(",
                    "position": {
                        "top": 0.1985959452146464,
                        "left": 0.2590359341993464,
                        "width": 0.006330808893423202,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 355,
                    "endIndex": 356
                },
                {
                    "text": "X, Y",
                    "position": {
                        "top": 0.1985959452146464,
                        "left": 0.26536599967320257,
                        "width": 0.03055360044244277,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 357,
                    "endIndex": 361
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.1985959452146464,
                        "left": 0.29591960011564533,
                        "width": 0.003609799786315388,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 362,
                    "endIndex": 363
                },
                {
                    "text": ")",
                    "position": {
                        "top": 0.1985959452146464,
                        "left": 0.2995293999019607,
                        "width": 0.006330808893423202,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 364,
                    "endIndex": 365
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.1985959452146464,
                        "left": 0.30586020879538395,
                        "width": 0.005023766073897067,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 366,
                    "endIndex": 367
                },
                {
                    "text": "of the current autoencoder.",
                    "position": {
                        "top": 0.1985959452146464,
                        "left": 0.310883974869281,
                        "width": 0.17735706581086597,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 368,
                    "endIndex": 395
                }
            ],
            [
                {
                    "text": "Assuming the parameters are",
                    "position": {
                        "top": 0.21369064208333324,
                        "left": 0.08823527949346402,
                        "width": 0.1943032526405229,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 396,
                    "endIndex": 423
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.21369064208333324,
                        "left": 0.28253853213398683,
                        "width": 0.005696749843137341,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 424,
                    "endIndex": 425
                },
                {
                    "text": "θ",
                    "position": {
                        "top": 0.21369064208333324,
                        "left": 0.28823528197712417,
                        "width": 0.007641248893218954,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 426,
                    "endIndex": 427
                },
                {
                    "text": ", then",
                    "position": {
                        "top": 0.21369064208333324,
                        "left": 0.2963284193137255,
                        "width": 0.03779927552205885,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 428,
                    "endIndex": 434
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.2526578131818181,
                        "left": 0.11320750477124185,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 435,
                    "endIndex": 435
                },
                {
                    "text": "θ",
                    "position": {
                        "top": 0.2526578131818181,
                        "left": 0.11320750477124185,
                        "width": 0.007641248893218954,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 436,
                    "endIndex": 437
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2526578131818181,
                        "left": 0.12084875366446081,
                        "width": 0.004974764505473867,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 438,
                    "endIndex": 439
                },
                {
                    "text": "= arg min",
                    "position": {
                        "top": 0.2526578131818181,
                        "left": 0.12582351816993467,
                        "width": 0.06990424157916668,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 440,
                    "endIndex": 449
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.26086867147727266,
                        "left": 0.17889051359477126,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 450,
                    "endIndex": 450
                },
                {
                    "text": "θ",
                    "position": {
                        "top": 0.26086867147727266,
                        "left": 0.17889051359477126,
                        "width": 0.006200072994276144,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 451,
                    "endIndex": 452
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.26086867147727266,
                        "left": 0.1850905865890474,
                        "width": 0.013353848574351316,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 453,
                    "endIndex": 454
                }
            ],
            [
                {
                    "text": "L",
                    "position": {
                        "top": 0.2526578131818181,
                        "left": 0.1984444351633987,
                        "width": 0.01107932253243464,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 455,
                    "endIndex": 456
                },
                {
                    "text": "(",
                    "position": {
                        "top": 0.2526578131818181,
                        "left": 0.20952450071895426,
                        "width": 0.006330808893423202,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 457,
                    "endIndex": 458
                },
                {
                    "text": "X, Y",
                    "position": {
                        "top": 0.2526578131818181,
                        "left": 0.21585456619281046,
                        "width": 0.03055360044244277,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 459,
                    "endIndex": 463
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2526578131818181,
                        "left": 0.24640816663525322,
                        "width": 0.003609799786315388,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 464,
                    "endIndex": 465
                },
                {
                    "text": ") = arg min",
                    "position": {
                        "top": 0.2526578131818181,
                        "left": 0.2500179664215686,
                        "width": 0.0807605451302696,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 466,
                    "endIndex": 477
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.26086867147727266,
                        "left": 0.31393626710784317,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 478,
                    "endIndex": 478
                },
                {
                    "text": "θ",
                    "position": {
                        "top": 0.26086867147727266,
                        "left": 0.31393626710784317,
                        "width": 0.006200072994276144,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 479,
                    "endIndex": 480
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.2441477118560606,
                        "left": 0.33544443720588235,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 481,
                    "endIndex": 481
                },
                {
                    "text": "1",
                    "position": {
                        "top": 0.2441477118560606,
                        "left": 0.33544443720588235,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 482,
                    "endIndex": 483
                }
            ],
            [
                {
                    "text": "2",
                    "position": {
                        "top": 0.26128664885101016,
                        "left": 0.33544445658496735,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 484,
                    "endIndex": 485
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.23633967988636365,
                        "left": 0.3566519730882353,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 486,
                    "endIndex": 486
                },
                {
                    "text": "p",
                    "position": {
                        "top": 0.23633967988636365,
                        "left": 0.3566519730882353,
                        "width": 0.006710573398877451,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 487,
                    "endIndex": 488
                },
                {
                    "text": "∑",
                    "position": {
                        "top": 0.24070710425505054,
                        "left": 0.3482500119771242,
                        "width": 0.02351466558639706,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 489,
                    "endIndex": 490
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.2675000326641415,
                        "left": 0.34946406421568627,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 491,
                    "endIndex": 491
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.2675000326641415,
                        "left": 0.34946406421568627,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 492,
                    "endIndex": 493
                },
                {
                    "text": "=1",
                    "position": {
                        "top": 0.2675000326641415,
                        "left": 0.35406863949346407,
                        "width": 0.016483009715531044,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 494,
                    "endIndex": 496
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.25265786082070724,
                        "left": 0.37447713584967324,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 497,
                    "endIndex": 497
                },
                {
                    "text": "‖",
                    "position": {
                        "top": 0.25265786082070724,
                        "left": 0.37447713584967324,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 498,
                    "endIndex": 499
                },
                {
                    "text": "(",
                    "position": {
                        "top": 0.25265786082070724,
                        "left": 0.38261765851307195,
                        "width": 0.006330808893423202,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 500,
                    "endIndex": 501
                },
                {
                    "text": "x",
                    "position": {
                        "top": 0.25265786082070724,
                        "left": 0.3889477239869281,
                        "width": 0.009303310060661764,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 502,
                    "endIndex": 503
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.25454422439393953,
                        "left": 0.39825164514705885,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 504,
                    "endIndex": 505
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.25454422439393953,
                        "left": 0.40285754388678763,
                        "width": 0.004431683155696039,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 506,
                    "endIndex": 507
                },
                {
                    "text": "−",
                    "position": {
                        "top": 0.25265786082070724,
                        "left": 0.40728922704248366,
                        "width": 0.012661617786846404,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 508,
                    "endIndex": 509
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.25265786082070724,
                        "left": 0.4199508448293301,
                        "width": 0.0036161598275326347,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 510,
                    "endIndex": 511
                },
                {
                    "text": "y",
                    "position": {
                        "top": 0.25265786082070724,
                        "left": 0.42356700465686276,
                        "width": 0.007981474930433007,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 512,
                    "endIndex": 513
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.25454422439393953,
                        "left": 0.4315490311601307,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 514,
                    "endIndex": 515
                },
                {
                    "text": ")",
                    "position": {
                        "top": 0.25265786082070724,
                        "left": 0.43696896563725485,
                        "width": 0.006330808893423202,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 516,
                    "endIndex": 517
                },
                {
                    "text": "‖",
                    "position": {
                        "top": 0.25265786082070724,
                        "left": 0.4432990311111111,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 518,
                    "endIndex": 519
                },
                {
                    "text": "2",
                    "position": {
                        "top": 0.24746467911616177,
                        "left": 0.4514379199019608,
                        "width": 0.006489508491527778,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 520,
                    "endIndex": 521
                },
                {
                    "text": ",",
                    "position": {
                        "top": 0.25265786082070724,
                        "left": 0.4587418411437908,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 522,
                    "endIndex": 523
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.29236998159090916,
                        "left": 0.08823530519607839,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 524,
                    "endIndex": 524
                },
                {
                    "text": "where",
                    "position": {
                        "top": 0.29236998159090916,
                        "left": 0.08823530519607839,
                        "width": 0.039769005211192816,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 525,
                    "endIndex": 530
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.29236998159090916,
                        "left": 0.12800431040727123,
                        "width": 0.009389490001225468,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 531,
                    "endIndex": 532
                },
                {
                    "text": "θ",
                    "position": {
                        "top": 0.29236998159090916,
                        "left": 0.1373938004084967,
                        "width": 0.007641248893218954,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 533,
                    "endIndex": 534
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.29236998159090916,
                        "left": 0.14503504930171565,
                        "width": 0.00984077782246733,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 535,
                    "endIndex": 536
                },
                {
                    "text": "includes the weights and biases of the current",
                    "position": {
                        "top": 0.29236998159090916,
                        "left": 0.15487582712418296,
                        "width": 0.3333564014387253,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 537,
                    "endIndex": 583
                }
            ],
            [
                {
                    "text": "autoencoder,",
                    "position": {
                        "top": 0.307464678459596,
                        "left": 0.08823530359477122,
                        "width": 0.08297282831004903,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 584,
                    "endIndex": 596
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.307464678459596,
                        "left": 0.1712081319048203,
                        "width": 0.005407891787990147,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 597,
                    "endIndex": 598
                },
                {
                    "text": "X, Y",
                    "position": {
                        "top": 0.307464678459596,
                        "left": 0.17661602369281043,
                        "width": 0.03055360044244282,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 599,
                    "endIndex": 603
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.307464678459596,
                        "left": 0.20716962413525328,
                        "width": 0.009018295635988521,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 604,
                    "endIndex": 605
                },
                {
                    "text": "is the input and the output of the current",
                    "position": {
                        "top": 0.307464678459596,
                        "left": 0.2161879197712418,
                        "width": 0.2720505997091503,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 606,
                    "endIndex": 648
                }
            ],
            [
                {
                    "text": "autoencoder. The hidden layer of the current autoencoder",
                    "position": {
                        "top": 0.3225593753282828,
                        "left": 0.08823530669934636,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 649,
                    "endIndex": 705
                }
            ],
            [
                {
                    "text": "is the input layer of the next autoencoder. Thus the deep",
                    "position": {
                        "top": 0.3376553353156566,
                        "left": 0.08823530669934636,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 706,
                    "endIndex": 763
                }
            ],
            [
                {
                    "text": "architecture can be pre-trained layer by layer. After pre-",
                    "position": {
                        "top": 0.3527500321843435,
                        "left": 0.08823530669934636,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 764,
                    "endIndex": 822
                }
            ],
            [
                {
                    "text": "training,",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.08823530669934636,
                        "width": 0.05471290483619282,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 823,
                    "endIndex": 832
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.14294821153553916,
                        "width": 0.009799812172385621,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 833,
                    "endIndex": 834
                },
                {
                    "text": "fine-tune",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.15274802370792478,
                        "width": 0.05787098384191177,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 835,
                    "endIndex": 844
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.21061900754983656,
                        "width": 0.009799812172385621,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 845,
                    "endIndex": 846
                },
                {
                    "text": "all",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.2204188197222222,
                        "width": 0.016278757761437907,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 847,
                    "endIndex": 850
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.23669757748366005,
                        "width": 0.009799812172385621,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 851,
                    "endIndex": 852
                },
                {
                    "text": "the",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.24649738965604567,
                        "width": 0.019892641984477124,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 853,
                    "endIndex": 856
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.2663900316405228,
                        "width": 0.009783533414624188,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 857,
                    "endIndex": 858
                },
                {
                    "text": "parameters",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.27617356505514695,
                        "width": 0.07141491029942809,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 859,
                    "endIndex": 869
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.34758847535457493,
                        "width": 0.009799812172385621,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 870,
                    "endIndex": 871
                },
                {
                    "text": "by",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.35738828752696056,
                        "width": 0.01627875776143791,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 872,
                    "endIndex": 874
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.37366704528839845,
                        "width": 0.009799812172385621,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 875,
                    "endIndex": 876
                },
                {
                    "text": "minimizing",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.38346685746078407,
                        "width": 0.07507763079575162,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 877,
                    "endIndex": 887
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.45854448825653565,
                        "width": 0.009799812172385666,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 888,
                    "endIndex": 889
                },
                {
                    "text": "the",
                    "position": {
                        "top": 0.3678447290530303,
                        "left": 0.46834430042892133,
                        "width": 0.019892641984477124,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 890,
                    "endIndex": 893
                }
            ],
            [
                {
                    "text": "recovery error, then",
                    "position": {
                        "top": 0.38293942592171715,
                        "left": 0.08823530669934636,
                        "width": 0.1309300486752451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 894,
                    "endIndex": 914
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.42190659702020195,
                        "left": 0.1082565489215686,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 915,
                    "endIndex": 915
                },
                {
                    "text": "θ",
                    "position": {
                        "top": 0.42190659702020195,
                        "left": 0.1082565489215686,
                        "width": 0.007641248893218954,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 916,
                    "endIndex": 917
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.42190659702020195,
                        "left": 0.11589779781478754,
                        "width": 0.004974764505473867,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 918,
                    "endIndex": 919
                },
                {
                    "text": "= arg min",
                    "position": {
                        "top": 0.42190659702020195,
                        "left": 0.1208725623202614,
                        "width": 0.06990424157916668,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 920,
                    "endIndex": 929
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.4301187184595959,
                        "left": 0.173939557745098,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 930,
                    "endIndex": 930
                },
                {
                    "text": "θ",
                    "position": {
                        "top": 0.4301187184595959,
                        "left": 0.173939557745098,
                        "width": 0.006200072994276144,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 931,
                    "endIndex": 932
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.4301187184595959,
                        "left": 0.18013963073937414,
                        "width": 0.013353848574351316,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 933,
                    "endIndex": 934
                }
            ],
            [
                {
                    "text": "L",
                    "position": {
                        "top": 0.42190659702020195,
                        "left": 0.19349347931372546,
                        "width": 0.01107932253243464,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 935,
                    "endIndex": 936
                },
                {
                    "text": "(",
                    "position": {
                        "top": 0.42190659702020195,
                        "left": 0.20457354486928103,
                        "width": 0.006330808893423202,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 937,
                    "endIndex": 938
                },
                {
                    "text": "X",
                    "position": {
                        "top": 0.42190659702020195,
                        "left": 0.21090361034313723,
                        "width": 0.01348695080535131,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 939,
                    "endIndex": 940
                },
                {
                    "text": "r",
                    "position": {
                        "top": 0.41671341531565653,
                        "left": 0.2256666819607843,
                        "width": 0.006043960147333333,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 941,
                    "endIndex": 942
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.41671341531565653,
                        "left": 0.23171064210811762,
                        "width": 0.0011651904409019415,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 943,
                    "endIndex": 944
                },
                {
                    "text": ", Y",
                    "position": {
                        "top": 0.42190659702020195,
                        "left": 0.23287583254901956,
                        "width": 0.01669223820857841,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 945,
                    "endIndex": 948
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.42190659702020195,
                        "left": 0.24956807075759796,
                        "width": 0.003611682771813737,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 949,
                    "endIndex": 950
                },
                {
                    "text": ") = arg min",
                    "position": {
                        "top": 0.42190659702020195,
                        "left": 0.2531797535294117,
                        "width": 0.0807605451302696,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 951,
                    "endIndex": 962
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.4301187184595959,
                        "left": 0.3170996873039215,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 963,
                    "endIndex": 963
                },
                {
                    "text": "θ",
                    "position": {
                        "top": 0.4301187184595959,
                        "left": 0.3170996873039215,
                        "width": 0.006200072994276144,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 964,
                    "endIndex": 965
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.4133964957070706,
                        "left": 0.33860622276143787,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 966,
                    "endIndex": 966
                },
                {
                    "text": "1",
                    "position": {
                        "top": 0.4133964957070706,
                        "left": 0.33860622276143787,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 967,
                    "endIndex": 968
                }
            ],
            [
                {
                    "text": "2",
                    "position": {
                        "top": 0.4305353646464647,
                        "left": 0.3386062173202614,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 969,
                    "endIndex": 970
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.40558839568181826,
                        "left": 0.35981373382352944,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 971,
                    "endIndex": 971
                },
                {
                    "text": "p",
                    "position": {
                        "top": 0.40558839568181826,
                        "left": 0.35981373382352944,
                        "width": 0.006710573398877451,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 972,
                    "endIndex": 973
                },
                {
                    "text": "∑",
                    "position": {
                        "top": 0.40995708257575764,
                        "left": 0.3514134073529412,
                        "width": 0.02351466558639706,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 974,
                    "endIndex": 975
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.43674874906565664,
                        "left": 0.35262582562091505,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 976,
                    "endIndex": 976
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.43674874906565664,
                        "left": 0.35262582562091505,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 977,
                    "endIndex": 978
                },
                {
                    "text": "=1",
                    "position": {
                        "top": 0.43674874906565664,
                        "left": 0.3572320347712418,
                        "width": 0.016483009715531044,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 979,
                    "endIndex": 981
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.42190657722222225,
                        "left": 0.37764053112745094,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 982,
                    "endIndex": 982
                },
                {
                    "text": "‖",
                    "position": {
                        "top": 0.42190657722222225,
                        "left": 0.37764053112745094,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 983,
                    "endIndex": 984
                },
                {
                    "text": "(",
                    "position": {
                        "top": 0.42190657722222225,
                        "left": 0.3857794199183006,
                        "width": 0.006330808893423202,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 985,
                    "endIndex": 986
                },
                {
                    "text": "x",
                    "position": {
                        "top": 0.42190657722222225,
                        "left": 0.39210948539215684,
                        "width": 0.009303310060661764,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 987,
                    "endIndex": 988
                },
                {
                    "text": "r",
                    "position": {
                        "top": 0.41671339551767683,
                        "left": 0.4014134065522875,
                        "width": 0.006043960147333333,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 989,
                    "endIndex": 990
                }
            ],
            [
                {
                    "text": "i",
                    "position": {
                        "top": 0.42501642608585866,
                        "left": 0.4014134065522875,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 991,
                    "endIndex": 992
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.42501642608585866,
                        "left": 0.4060193052920163,
                        "width": 0.006220898498833298,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 993,
                    "endIndex": 994
                },
                {
                    "text": "−",
                    "position": {
                        "top": 0.42190657755050515,
                        "left": 0.41224020379084964,
                        "width": 0.012661617786846404,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 995,
                    "endIndex": 996
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.42190657755050515,
                        "left": 0.42490182157769607,
                        "width": 0.0036161598275326347,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 997,
                    "endIndex": 998
                },
                {
                    "text": "y",
                    "position": {
                        "top": 0.42190657755050515,
                        "left": 0.4285179814052287,
                        "width": 0.007981474930433007,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 999,
                    "endIndex": 1000
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.4237942038131314,
                        "left": 0.43650000790849663,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1001,
                    "endIndex": 1002
                },
                {
                    "text": ")",
                    "position": {
                        "top": 0.42190657755050515,
                        "left": 0.4419199423856208,
                        "width": 0.006330808893423202,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1003,
                    "endIndex": 1004
                },
                {
                    "text": "‖",
                    "position": {
                        "top": 0.42190657755050515,
                        "left": 0.44825000785947705,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1005,
                    "endIndex": 1006
                },
                {
                    "text": "2",
                    "position": {
                        "top": 0.4167133958459597,
                        "left": 0.4563888966503267,
                        "width": 0.006489508491527778,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1007,
                    "endIndex": 1008
                },
                {
                    "text": ".",
                    "position": {
                        "top": 0.42190657755050515,
                        "left": 0.4636928178921568,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1009,
                    "endIndex": 1010
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.46146213198232333,
                        "left": 0.08823530357843126,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1011,
                    "endIndex": 1011
                },
                {
                    "text": "Until now, the deep architecture has been trained completely.",
                    "position": {
                        "top": 0.46146213198232333,
                        "left": 0.08823530357843126,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1012,
                    "endIndex": 1073
                }
            ],
            [
                {
                    "text": "The above training process is based on an assumption that the",
                    "position": {
                        "top": 0.47655682885101014,
                        "left": 0.08823530357843126,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1074,
                    "endIndex": 1135
                }
            ],
            [
                {
                    "text": "meta parameters such as the number of layers and the number",
                    "position": {
                        "top": 0.49165278883838387,
                        "left": 0.08823530357843126,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1136,
                    "endIndex": 1195
                }
            ],
            [
                {
                    "text": "of nodes in each layer have been set. In practise, we usually",
                    "position": {
                        "top": 0.5067474857070707,
                        "left": 0.08823530357843126,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1196,
                    "endIndex": 1257
                }
            ],
            [
                {
                    "text": "choose the proper meta parameters through experiences and",
                    "position": {
                        "top": 0.5218421825757575,
                        "left": 0.08823530357843126,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1258,
                    "endIndex": 1315
                }
            ],
            [
                {
                    "text": "experiments.",
                    "position": {
                        "top": 0.5369368794444443,
                        "left": 0.08823530357843126,
                        "width": 0.08339607601184641,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1316,
                    "endIndex": 1328
                }
            ],
            [
                {
                    "text": "Input",
                    "position": {
                        "top": 0.8020049829164636,
                        "left": 0.15915993666330394,
                        "width": 0.03400512724442354,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1329,
                    "endIndex": 1334
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8020049829164636,
                        "left": 0.19316506390772747,
                        "width": 0.00007936809685911372,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1335,
                    "endIndex": 1336
                },
                {
                    "text": "layer",
                    "position": {
                        "top": 0.8020049829164636,
                        "left": 0.19718910261185751,
                        "width": 0.03219357862983524,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1337,
                    "endIndex": 1342
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.7448463767335732,
                        "left": 0.15258873790208693,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1343,
                    "endIndex": 1343
                },
                {
                    "text": "Hidden layer",
                    "position": {
                        "top": 0.7448463767335732,
                        "left": 0.15258873790208693,
                        "width": 0.08364196356630572,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1344,
                    "endIndex": 1356
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.7750941055643248,
                        "left": 0.16298920203297387,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1357,
                    "endIndex": 1357
                },
                {
                    "text": "W",
                    "position": {
                        "top": 0.7750941055643248,
                        "left": 0.16298920203297387,
                        "width": 0.015206258433505884,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1358,
                    "endIndex": 1359
                },
                {
                    "text": "1",
                    "position": {
                        "top": 0.776872337887557,
                        "left": 0.17819350760965033,
                        "width": 0.005234542741176472,
                        "height": 0.008089747872727274
                    },
                    "startIndex": 1360,
                    "endIndex": 1361
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.8726879388124411,
                        "left": 0.14374046463033008,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1362,
                    "endIndex": 1362
                },
                {
                    "text": "Raw input data",
                    "position": {
                        "top": 0.8726879388124411,
                        "left": 0.14374046463033008,
                        "width": 0.09752705439585885,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1363,
                    "endIndex": 1377
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.830495820052332,
                        "left": 0.1218918987178719,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1378,
                    "endIndex": 1378
                },
                {
                    "text": "Destroyed",
                    "position": {
                        "top": 0.830495820052332,
                        "left": 0.1218918987178719,
                        "width": 0.06620393834588235,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1379,
                    "endIndex": 1388
                }
            ],
            [
                {
                    "text": "partially",
                    "position": {
                        "top": 0.8454329708917553,
                        "left": 0.12815645424374247,
                        "width": 0.05367475356235296,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1389,
                    "endIndex": 1398
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5734692230141455,
                        "left": 0.3665927238220582,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1399,
                    "endIndex": 1399
                },
                {
                    "text": "Error",
                    "position": {
                        "top": 0.5734692230141455,
                        "left": 0.3665927238220582,
                        "width": 0.03398633806512942,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1400,
                    "endIndex": 1405
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6868848919883722,
                        "left": 0.15258873790208693,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1406,
                    "endIndex": 1406
                },
                {
                    "text": "Hidden layer",
                    "position": {
                        "top": 0.6868848919883722,
                        "left": 0.15258873790208693,
                        "width": 0.08364196356630572,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1407,
                    "endIndex": 1419
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.7171237277547989,
                        "left": 0.16298920203297387,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1420,
                    "endIndex": 1420
                },
                {
                    "text": "W",
                    "position": {
                        "top": 0.7171237277547989,
                        "left": 0.16298920203297387,
                        "width": 0.015206258433505884,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1421,
                    "endIndex": 1422
                },
                {
                    "text": "2",
                    "position": {
                        "top": 0.7189108599352034,
                        "left": 0.17819350760965033,
                        "width": 0.005234542741176472,
                        "height": 0.008089747872727274
                    },
                    "startIndex": 1423,
                    "endIndex": 1424
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6289145209539115,
                        "left": 0.15258873790208693,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1425,
                    "endIndex": 1425
                },
                {
                    "text": "Hidden layer",
                    "position": {
                        "top": 0.6289145209539115,
                        "left": 0.15258873790208693,
                        "width": 0.08364196356630572,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1426,
                    "endIndex": 1438
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.659162243009598,
                        "left": 0.16415247720068105,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1439,
                    "endIndex": 1439
                },
                {
                    "text": "W",
                    "position": {
                        "top": 0.659162243009598,
                        "left": 0.16415247720068105,
                        "width": 0.015206258433505884,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1440,
                    "endIndex": 1441
                },
                {
                    "text": "l",
                    "position": {
                        "top": 0.6609404753328303,
                        "left": 0.17935678278886374,
                        "width": 0.0029104057640941183,
                        "height": 0.008089747872727274
                    },
                    "startIndex": 1442,
                    "endIndex": 1443
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5726512513493449,
                        "left": 0.15630064297606275,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1444,
                    "endIndex": 1444
                },
                {
                    "text": "Ouput",
                    "position": {
                        "top": 0.5726512513493449,
                        "left": 0.15630064297606275,
                        "width": 0.0402739032938353,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1445,
                    "endIndex": 1450
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5726512513493449,
                        "left": 0.19657454626989804,
                        "width": 0.00007938709490740744,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1451,
                    "endIndex": 1452
                },
                {
                    "text": "layer",
                    "position": {
                        "top": 0.5726512513493449,
                        "left": 0.20059954819331471,
                        "width": 0.03219357862983524,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1453,
                    "endIndex": 1458
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6011918855519411,
                        "left": 0.15858347179932974,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1459,
                    "endIndex": 1459
                },
                {
                    "text": "W",
                    "position": {
                        "top": 0.6011918855519411,
                        "left": 0.15858347179932974,
                        "width": 0.015206258433505884,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1460,
                    "endIndex": 1461
                },
                {
                    "text": "l+1",
                    "position": {
                        "top": 0.6029701178751735,
                        "left": 0.17378777737600623,
                        "width": 0.014047148801166372,
                        "height": 0.008089747872727274
                    },
                    "startIndex": 1462,
                    "endIndex": 1465
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6156133507869682,
                        "left": 0.3397142185335098,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1466,
                    "endIndex": 1466
                },
                {
                    "text": "Raw input data",
                    "position": {
                        "top": 0.6156133507869682,
                        "left": 0.3397142185335098,
                        "width": 0.09752705439585874,
                        "height": 0.012447341745454546
                    },
                    "startIndex": 1467,
                    "endIndex": 1481
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.9039760069444445,
                        "left": 0.15389705482026145,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1482,
                    "endIndex": 1482
                },
                {
                    "text": "Fig. 4.",
                    "position": {
                        "top": 0.9039760069444445,
                        "left": 0.15389705482026145,
                        "width": 0.03495383690405228,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1483,
                    "endIndex": 1490
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.9039760069444445,
                        "left": 0.1888508917243137,
                        "width": 0.013674191039215678,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1491,
                    "endIndex": 1492
                },
                {
                    "text": "The DSAE based imputation architecture",
                    "position": {
                        "top": 0.9039760069444445,
                        "left": 0.2025250827635294,
                        "width": 0.22005029141869284,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1493,
                    "endIndex": 1531
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.0783295583333334,
                        "left": 0.5117647008660131,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1532,
                    "endIndex": 1532
                },
                {
                    "text": "C. Imputation Patterns",
                    "position": {
                        "top": 0.0783295583333334,
                        "left": 0.5117647008660131,
                        "width": 0.15407844221200975,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1533,
                    "endIndex": 1555
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.0977714772095961,
                        "left": 0.528044113120915,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1556,
                    "endIndex": 1556
                },
                {
                    "text": "In this paper, we focus on the imputation process of traffic",
                    "position": {
                        "top": 0.0977714772095961,
                        "left": 0.528044113120915,
                        "width": 0.3837228779526144,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1557,
                    "endIndex": 1617
                }
            ],
            [
                {
                    "text": "data assuming all missing data have been recognized. In real",
                    "position": {
                        "top": 0.11286617407828294,
                        "left": 0.5117647008660131,
                        "width": 0.4000016357140518,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1618,
                    "endIndex": 1678
                }
            ],
            [
                {
                    "text": "world, the range of traffic data can be very wide including",
                    "position": {
                        "top": 0.12796087094696978,
                        "left": 0.5117647008660131,
                        "width": 0.4000016357140517,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1679,
                    "endIndex": 1738
                }
            ],
            [
                {
                    "text": "data from detectors and data from surveys. In terms of",
                    "position": {
                        "top": 0.14305556781565662,
                        "left": 0.5117647008660131,
                        "width": 0.4000016357140523,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1739,
                    "endIndex": 1793
                }
            ],
            [
                {
                    "text": "traffic data from detectors deployed in different locations,",
                    "position": {
                        "top": 0.15815026468434346,
                        "left": 0.5117647008660131,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1794,
                    "endIndex": 1854
                }
            ],
            [
                {
                    "text": "the proposed deep learning based imputation approach can",
                    "position": {
                        "top": 0.1732449615530303,
                        "left": 0.5117647008660131,
                        "width": 0.40000163571405184,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1855,
                    "endIndex": 1911
                }
            ],
            [
                {
                    "text": "use the data in different patterns. Traffic data from detectors",
                    "position": {
                        "top": 0.18834092154040408,
                        "left": 0.5117647008660131,
                        "width": 0.4000016357140524,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1912,
                    "endIndex": 1975
                }
            ],
            [
                {
                    "text": "naturally has a period (or cycle) of one day or one week.",
                    "position": {
                        "top": 0.2034356184090909,
                        "left": 0.5117647008660131,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1976,
                    "endIndex": 2033
                }
            ],
            [
                {
                    "text": "Assuming the obtained data are collected in",
                    "position": {
                        "top": 0.21853031527777775,
                        "left": 0.5117647008660131,
                        "width": 0.30421742504575133,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2034,
                    "endIndex": 2077
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.21853031527777775,
                        "left": 0.8159821259117644,
                        "width": 0.007298906653595106,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2078,
                    "endIndex": 2079
                },
                {
                    "text": "N",
                    "position": {
                        "top": 0.21853031527777775,
                        "left": 0.8232810325653596,
                        "width": 0.01307998186131536,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2080,
                    "endIndex": 2081
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.21853031527777775,
                        "left": 0.8363610144266749,
                        "width": 0.009076881553717395,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2082,
                    "endIndex": 2083
                },
                {
                    "text": "even time",
                    "position": {
                        "top": 0.21853031527777775,
                        "left": 0.8454378959803923,
                        "width": 0.0663196591200981,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2084,
                    "endIndex": 2093
                }
            ],
            [
                {
                    "text": "intervals during every period and contain",
                    "position": {
                        "top": 0.2336250121464646,
                        "left": 0.5117647055392158,
                        "width": 0.2746714797087418,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2094,
                    "endIndex": 2135
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2336250121464646,
                        "left": 0.7864361852479574,
                        "width": 0.005604675421977381,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2136,
                    "endIndex": 2137
                },
                {
                    "text": "D",
                    "position": {
                        "top": 0.2336250121464646,
                        "left": 0.7920408606699348,
                        "width": 0.013477183550694445,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2138,
                    "endIndex": 2139
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2336250121464646,
                        "left": 0.8055180442206293,
                        "width": 0.006052227658455859,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2140,
                    "endIndex": 2141
                },
                {
                    "text": "periods and",
                    "position": {
                        "top": 0.2336250121464646,
                        "left": 0.8115702718790851,
                        "width": 0.07703108172712418,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2142,
                    "endIndex": 2153
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2336250121464646,
                        "left": 0.8886013536062092,
                        "width": 0.005596370560457749,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2154,
                    "endIndex": 2155
                },
                {
                    "text": "M",
                    "position": {
                        "top": 0.2336250121464646,
                        "left": 0.8941977241666669,
                        "width": 0.015792022904370914,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2156,
                    "endIndex": 2157
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.24871970901515145,
                        "left": 0.5117647242320263,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2158,
                    "endIndex": 2158
                },
                {
                    "text": "locations, then the domain of the traffic data can be described",
                    "position": {
                        "top": 0.24871970901515145,
                        "left": 0.5117647242320263,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2159,
                    "endIndex": 2222
                }
            ],
            [
                {
                    "text": "as a cube in Fig. 5.",
                    "position": {
                        "top": 0.26381566900252523,
                        "left": 0.5117647242320263,
                        "width": 0.13066958855106192,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2223,
                    "endIndex": 2243
                }
            ],
            [
                {
                    "text": "…",
                    "position": {
                        "top": 0.3630316375273409,
                        "left": 0.5705668312966006,
                        "width": 0.008349845795835295,
                        "height": 0.006452153569509091
                    },
                    "startIndex": 2244,
                    "endIndex": 2245
                }
            ],
            [
                {
                    "text": "…",
                    "position": {
                        "top": 0.36948379109685003,
                        "left": 0.5705668314125707,
                        "width": 0.008349845795835295,
                        "height": 0.006452153569509091
                    },
                    "startIndex": 2246,
                    "endIndex": 2247
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.49137751262626267,
                        "left": 0.6319591546895424,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2248,
                    "endIndex": 2248
                },
                {
                    "text": "Fig. 5.",
                    "position": {
                        "top": 0.49137751262626267,
                        "left": 0.6319591546895424,
                        "width": 0.0349538369040523,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2249,
                    "endIndex": 2256
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.49137751262626267,
                        "left": 0.6669129915935949,
                        "width": 0.013674191039215655,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2257,
                    "endIndex": 2258
                },
                {
                    "text": "The traffic data cube",
                    "position": {
                        "top": 0.49137751262626267,
                        "left": 0.6805871826328105,
                        "width": 0.11098233908209151,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2259,
                    "endIndex": 2280
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5213143801388889,
                        "left": 0.5280441209150326,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2281,
                    "endIndex": 2281
                },
                {
                    "text": "According to the data structures adopted, there are various",
                    "position": {
                        "top": 0.5213143801388889,
                        "left": 0.5280441209150326,
                        "width": 0.38372287795261417,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2282,
                    "endIndex": 2341
                }
            ],
            [
                {
                    "text": "imputation patterns of the proposed approach. The simplest",
                    "position": {
                        "top": 0.5364103401262627,
                        "left": 0.5117647086601307,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2342,
                    "endIndex": 2400
                }
            ],
            [
                {
                    "text": "data structure is that one data item contains data of one",
                    "position": {
                        "top": 0.5515050369949495,
                        "left": 0.5117647086601307,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2401,
                    "endIndex": 2458
                }
            ],
            [
                {
                    "text": "period, single location thus the imputation process can be",
                    "position": {
                        "top": 0.5665997338636363,
                        "left": 0.5117647086601307,
                        "width": 0.40000163571405234,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2459,
                    "endIndex": 2517
                }
            ],
            [
                {
                    "text": "seen as a line recovery in the perspective of data cube. While",
                    "position": {
                        "top": 0.5816944307323231,
                        "left": 0.5117647086601307,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2518,
                    "endIndex": 2580
                }
            ],
            [
                {
                    "text": "the most complex data structure is that one data item contains",
                    "position": {
                        "top": 0.59678912760101,
                        "left": 0.5117647086601307,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2581,
                    "endIndex": 2643
                }
            ],
            [
                {
                    "text": "data of multiple periods, multiple locations thus the impu-",
                    "position": {
                        "top": 0.6118850875883837,
                        "left": 0.5117647086601307,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2644,
                    "endIndex": 2703
                }
            ],
            [
                {
                    "text": "tation process can be seen as a 3-D recovery. All possible",
                    "position": {
                        "top": 0.6269797844570705,
                        "left": 0.5117647086601307,
                        "width": 0.40000163571405245,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2704,
                    "endIndex": 2762
                }
            ],
            [
                {
                    "text": "imputation patterns are listed in Table I. The proposed deep",
                    "position": {
                        "top": 0.6420744813257574,
                        "left": 0.5117647086601307,
                        "width": 0.4000016357140524,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2763,
                    "endIndex": 2823
                }
            ],
            [
                {
                    "text": "learning based imputation approach can be applied to realize",
                    "position": {
                        "top": 0.6571691781944441,
                        "left": 0.5117647086601307,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2824,
                    "endIndex": 2884
                }
            ],
            [
                {
                    "text": "any of these patterns according to actual demand without too",
                    "position": {
                        "top": 0.6722638750631311,
                        "left": 0.5117647086601307,
                        "width": 0.4000016357140517,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2885,
                    "endIndex": 2945
                }
            ],
            [
                {
                    "text": "much work of selecting features artificially.",
                    "position": {
                        "top": 0.6873585719318179,
                        "left": 0.5117647086601307,
                        "width": 0.2908362861658494,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2946,
                    "endIndex": 2991
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.7121919043181816,
                        "left": 0.6869428126143791,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2992,
                    "endIndex": 2992
                },
                {
                    "text": "TABLE I",
                    "position": {
                        "top": 0.7121919043181816,
                        "left": 0.6869428126143791,
                        "width": 0.04964382499189543,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2993,
                    "endIndex": 3000
                }
            ],
            [
                {
                    "text": "I",
                    "position": {
                        "top": 0.7272866011868684,
                        "left": 0.646942813366013,
                        "width": 0.004336672015294117,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3001,
                    "endIndex": 3002
                },
                {
                    "text": "MPUTATION",
                    "position": {
                        "top": 0.7272866011868684,
                        "left": 0.6519313754084967,
                        "width": 0.06436527141977105,
                        "height": 0.008050631376262626
                    },
                    "startIndex": 3003,
                    "endIndex": 3012
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7272866011868684,
                        "left": 0.7162966468282678,
                        "width": 0.003901067322058942,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3013,
                    "endIndex": 3014
                },
                {
                    "text": "P",
                    "position": {
                        "top": 0.7272866011868684,
                        "left": 0.7201977141503267,
                        "width": 0.00724080973124183,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3015,
                    "endIndex": 3016
                },
                {
                    "text": "ATTERNS",
                    "position": {
                        "top": 0.7272866011868684,
                        "left": 0.72702124374183,
                        "width": 0.04957105234950964,
                        "height": 0.008050631376262626
                    },
                    "startIndex": 3017,
                    "endIndex": 3024
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.7584823261742424,
                        "left": 0.6451257942320261,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3025,
                    "endIndex": 3025
                },
                {
                    "text": "Period",
                    "position": {
                        "top": 0.7584823261742424,
                        "left": 0.6451257942320261,
                        "width": 0.034003155050849665,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3026,
                    "endIndex": 3032
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7584823261742424,
                        "left": 0.6791289492828759,
                        "width": 0.02822074066810452,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3033,
                    "endIndex": 3034
                },
                {
                    "text": "Location",
                    "position": {
                        "top": 0.7584823261742424,
                        "left": 0.7073496899509805,
                        "width": 0.04629690394705882,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3035,
                    "endIndex": 3043
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7584823261742424,
                        "left": 0.7536465938980396,
                        "width": 0.02278965708235259,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3044,
                    "endIndex": 3045
                },
                {
                    "text": "Pattern",
                    "position": {
                        "top": 0.7584823261742424,
                        "left": 0.7764362509803922,
                        "width": 0.03669892414143794,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3046,
                    "endIndex": 3053
                }
            ],
            [
                {
                    "text": "1",
                    "position": {
                        "top": 0.7703068088005051,
                        "left": 0.6103937984150327,
                        "width": 0.006511519542483659,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3054,
                    "endIndex": 3055
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7703068088005051,
                        "left": 0.6169053179575164,
                        "width": 0.028578359705882267,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3056,
                    "endIndex": 3057
                },
                {
                    "text": "Single",
                    "position": {
                        "top": 0.7703068088005051,
                        "left": 0.6454836776633986,
                        "width": 0.033286887901176475,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3058,
                    "endIndex": 3064
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7703068088005051,
                        "left": 0.6787705655645753,
                        "width": 0.03508400600405212,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3065,
                    "endIndex": 3066
                },
                {
                    "text": "Single",
                    "position": {
                        "top": 0.7703068088005051,
                        "left": 0.7138545715686274,
                        "width": 0.033286887901176475,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3067,
                    "endIndex": 3073
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7703068088005051,
                        "left": 0.747141459469804,
                        "width": 0.03751868041581688,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3074,
                    "endIndex": 3075
                },
                {
                    "text": "1-D",
                    "position": {
                        "top": 0.7703068088005051,
                        "left": 0.7846601398856209,
                        "width": 0.02025082577712418,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3076,
                    "endIndex": 3079
                }
            ],
            [
                {
                    "text": "2",
                    "position": {
                        "top": 0.782131310669192,
                        "left": 0.6103937984150327,
                        "width": 0.006511519542483659,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3080,
                    "endIndex": 3081
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.782131310669192,
                        "left": 0.6169053179575164,
                        "width": 0.028578359705882267,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3082,
                    "endIndex": 3083
                },
                {
                    "text": "Single",
                    "position": {
                        "top": 0.782131310669192,
                        "left": 0.6454836776633986,
                        "width": 0.033286887901176475,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3084,
                    "endIndex": 3090
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.782131310669192,
                        "left": 0.6787705655645753,
                        "width": 0.029296437066143665,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3091,
                    "endIndex": 3092
                },
                {
                    "text": "Multiple",
                    "position": {
                        "top": 0.782131310669192,
                        "left": 0.708067002630719,
                        "width": 0.04486436964771242,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3093,
                    "endIndex": 3101
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.782131310669192,
                        "left": 0.7529313722784317,
                        "width": 0.031728767607189304,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3102,
                    "endIndex": 3103
                },
                {
                    "text": "2-D",
                    "position": {
                        "top": 0.782131310669192,
                        "left": 0.7846601398856209,
                        "width": 0.02025082577712418,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3104,
                    "endIndex": 3107
                }
            ],
            [
                {
                    "text": "3",
                    "position": {
                        "top": 0.7939558125631313,
                        "left": 0.6103937984150327,
                        "width": 0.006511519542483659,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3108,
                    "endIndex": 3109
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7939558125631313,
                        "left": 0.6169053179575164,
                        "width": 0.022790740915032658,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3110,
                    "endIndex": 3111
                },
                {
                    "text": "Multiple",
                    "position": {
                        "top": 0.7939558125631313,
                        "left": 0.6396960588725491,
                        "width": 0.04486436964771242,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3112,
                    "endIndex": 3120
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7939558125631313,
                        "left": 0.6845604285202618,
                        "width": 0.029294143048365695,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3121,
                    "endIndex": 3122
                },
                {
                    "text": "Single",
                    "position": {
                        "top": 0.7939558125631313,
                        "left": 0.7138545715686274,
                        "width": 0.033286887901176475,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3123,
                    "endIndex": 3129
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7939558125631313,
                        "left": 0.747141459469804,
                        "width": 0.03751868041581688,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3130,
                    "endIndex": 3131
                },
                {
                    "text": "2-D",
                    "position": {
                        "top": 0.7939558125631313,
                        "left": 0.7846601398856209,
                        "width": 0.02025082577712418,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3132,
                    "endIndex": 3135
                }
            ],
            [
                {
                    "text": "4",
                    "position": {
                        "top": 0.8057802951893939,
                        "left": 0.6103937984150327,
                        "width": 0.006511519542483659,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3136,
                    "endIndex": 3137
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8057802951893939,
                        "left": 0.6169053179575164,
                        "width": 0.022790740915032658,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3138,
                    "endIndex": 3139
                },
                {
                    "text": "Multiple",
                    "position": {
                        "top": 0.8057802951893939,
                        "left": 0.6396960588725491,
                        "width": 0.04486436964771242,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3140,
                    "endIndex": 3148
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8057802951893939,
                        "left": 0.6845604285202618,
                        "width": 0.023506574110457243,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3149,
                    "endIndex": 3150
                },
                {
                    "text": "Multiple",
                    "position": {
                        "top": 0.8057802951893939,
                        "left": 0.708067002630719,
                        "width": 0.04486436964771242,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3151,
                    "endIndex": 3159
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8057802951893939,
                        "left": 0.7529313722784317,
                        "width": 0.031728767607189304,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3160,
                    "endIndex": 3161
                },
                {
                    "text": "3-D",
                    "position": {
                        "top": 0.8057802951893939,
                        "left": 0.7846601398856209,
                        "width": 0.02025082577712418,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3162,
                    "endIndex": 3165
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.8542992466666666,
                        "left": 0.5764640359477124,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3166,
                    "endIndex": 3166
                },
                {
                    "text": "IV. EXPERIMENTS AND RESULTS",
                    "position": {
                        "top": 0.8542992466666666,
                        "left": 0.5764640359477124,
                        "width": 0.270601790268383,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3167,
                    "endIndex": 3194
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.8740138935353535,
                        "left": 0.5117646884477124,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3195,
                    "endIndex": 3195
                },
                {
                    "text": "A. Data description",
                    "position": {
                        "top": 0.8740138935353535,
                        "left": 0.5117646884477124,
                        "width": 0.13366487997916662,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3196,
                    "endIndex": 3215
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.8934545504797979,
                        "left": 0.5280441007026143,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3216,
                    "endIndex": 3216
                },
                {
                    "text": "The proposed deep learning based approach for traffic data",
                    "position": {
                        "top": 0.8934545504797979,
                        "left": 0.5280441007026143,
                        "width": 0.38372287795261395,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3217,
                    "endIndex": 3275
                }
            ],
            [
                {
                    "text": "imputation is experimented on the data set collected from",
                    "position": {
                        "top": 0.9085505104671717,
                        "left": 0.5117646884477124,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3276,
                    "endIndex": 3333
                }
            ],
            [
                {
                    "text": "the Caltrans Performance Measurement System (PeMS). The",
                    "position": {
                        "top": 0.9236452073358585,
                        "left": 0.5117646884477124,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3334,
                    "endIndex": 3389
                }
            ],
            [
                {
                    "text": "914",
                    "position": {
                        "top": 0.954040404040404,
                        "left": 0.48909803921568623,
                        "width": 0.021803921568627455,
                        "height": 0.010101010101010102
                    },
                    "startIndex": 3390,
                    "endIndex": 3393
                }
            ]
        ],
        "page": 3
    },
    {
        "id": "page_4",
        "block_type": "Page",
        "text": "system consists of more than 15000 detector stations and collects traffic data every 30 seconds. The raw 30-second dataset includes gaps due to various reasons. PeMS uses comprehensive algorithms to fill these gaps and aggregates the data into 5-minute increments. In this paper, we take the 5-minute flow data of one single detector station as the dataset of the experiments. We randomly choose the detector station 500010092 as an example and use its data of week- days in the year 2013. The imputation pattern experimented in this paper is 1-D, since one data item contains the flow data of single period and single location. Set the data period to be one day, then there are 288 time intervals in one period and 250 (the number of weekdays in the year 2013 apart from September 17) periods in total. Thus the dimension of the input and output is   q   =   288   and the number of data items is 250. We divide the whole 250 data items into training set and test set with a ratio of 3 to 2. The partially destroyed process is implemented by randomly setting some data missing according to the missing rate.  B. Criterions  To   evaluate   the   imputation   approach,   we   adopt   three criterions to measure the error of the imputed data. They are root mean square error (RMSE),  RM SE   = [  1  n  n ∑  i =1  ( x r i   −   y i ) 2 ]   1 2   ,  mean absolute error (MAE),  M AE   =  1  n  n ∑  i =1  | x r i   −   y i | ,  and mean relative error (MRE),  M RE   =  1  n  n ∑  i =1  | x r i   −   y i |  x r i  ,  where   n   is the total number of the missing data,   y i   is the  ith   imputed data and   x r i   is the corresponding raw data.  C. Structure setting of DSAE  The structure of DSAE includes the number of layers, the number of nodes in each layer and the activation functions of each layer. The input layer and output layer have been decided   to   contain   q   =   288   nodes.   A   typical   way   of setting hidden layers for the purpose of restoring data is to choose decreasing number of nodes then increasing number of nodes in symmetry. Therefore a reasonable set of the architecture of hidden layers is three layers with 144, 72, 144 nodes respectively. We choose the sigmoid function as the activation function of each layer.  D. Results and Analysis  We divide the dataset into training set and test set. Then we conduct series of experiments with the missing rate ranging from 0.01 to 0.90 and obtain the imputation results of the test set. Apart from the deep learning approach, we also conduct experiments with artificial neural networks with the same set of layers and nodes for contrast. All the experiments are conducted on a computer with Core i5 CPU and 4G RAM. Each experiment with a certain missing rate and using a certain network costs less than 1 second. The RMSE, MAE, MRE of the imputed data under different missing rates are shown in Fig. 6, 7, 8 respectively. The RMSE of our deep learning based approach ranges from 16.9 to 20.3 veh/5- minute while the MAE ranges from 11.3 to 13.8 veh/5- minute and the MRE ranges from 0.24 to 0.35 under all the experimented missing rates. Both the RMSE and the MAE of our approach are smaller than the neural network method with most missing rates. Additionally, the error fluctuation of our approach is smaller than the neural network which can be seen obviously from the contrast of MRE. 0   10   20   30   40   50   60   70   80   90 15 16 17 18 19 20 21  missing rate (%) RMSE of imputed data (veh/5-minute)  NN Deep learning  Fig. 6.   The RMSE of the imputed data 0   10   20   30   40   50   60   70   80   90 10 11 12 13 14 15  missing rate (%) MAE of imputed data (veh/5-minute)  NN Deep learning  Fig. 7.   The MAE of the imputed data  Fig. 9 displays the imputed data of one period with the deep learning based approach under the missing rate of 0.30. From that figure, we can see that the imputed data are quite consistent with the observed data. Considering 915",
        "textItems": [
            [
                {
                    "text": "system consists of more than 15000 detector stations and",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.08823529411764706,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 0,
                    "endIndex": 56
                }
            ],
            [
                {
                    "text": "collects traffic data every 30 seconds. The raw 30-second",
                    "position": {
                        "top": 0.09342548940656566,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 57,
                    "endIndex": 114
                }
            ],
            [
                {
                    "text": "dataset includes gaps due to various reasons. PeMS uses",
                    "position": {
                        "top": 0.10852018627525249,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 115,
                    "endIndex": 170
                }
            ],
            [
                {
                    "text": "comprehensive algorithms to fill these gaps and aggregates",
                    "position": {
                        "top": 0.12361488314393934,
                        "left": 0.08823529411764706,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 171,
                    "endIndex": 229
                }
            ],
            [
                {
                    "text": "the data into 5-minute increments. In this paper, we take",
                    "position": {
                        "top": 0.13870958001262618,
                        "left": 0.08823529411764706,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 230,
                    "endIndex": 287
                }
            ],
            [
                {
                    "text": "the 5-minute flow data of one single detector station as the",
                    "position": {
                        "top": 0.153804276881313,
                        "left": 0.08823529411764706,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 288,
                    "endIndex": 348
                }
            ],
            [
                {
                    "text": "dataset of the experiments. We randomly choose the detector",
                    "position": {
                        "top": 0.16889897374999985,
                        "left": 0.08823529411764706,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 349,
                    "endIndex": 408
                }
            ],
            [
                {
                    "text": "station 500010092 as an example and use its data of week-",
                    "position": {
                        "top": 0.18399493373737363,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 409,
                    "endIndex": 466
                }
            ],
            [
                {
                    "text": "days in the year 2013. The imputation pattern experimented",
                    "position": {
                        "top": 0.19908963060606047,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 467,
                    "endIndex": 525
                }
            ],
            [
                {
                    "text": "in this paper is 1-D, since one data item contains the flow",
                    "position": {
                        "top": 0.21418432747474733,
                        "left": 0.08823529411764706,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 526,
                    "endIndex": 585
                }
            ],
            [
                {
                    "text": "data of single period and single location. Set the data period",
                    "position": {
                        "top": 0.22927902434343417,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 586,
                    "endIndex": 648
                }
            ],
            [
                {
                    "text": "to be one day, then there are 288 time intervals in one period",
                    "position": {
                        "top": 0.244373721212121,
                        "left": 0.08823529411764706,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 649,
                    "endIndex": 711
                }
            ],
            [
                {
                    "text": "and 250 (the number of weekdays in the year 2013 apart",
                    "position": {
                        "top": 0.25946841808080784,
                        "left": 0.08823529411764706,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 712,
                    "endIndex": 766
                }
            ],
            [
                {
                    "text": "from September 17) periods in total. Thus the dimension",
                    "position": {
                        "top": 0.2745643780681816,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 767,
                    "endIndex": 822
                }
            ],
            [
                {
                    "text": "of the input and output is",
                    "position": {
                        "top": 0.2896590749368685,
                        "left": 0.08823529411764706,
                        "width": 0.18578946233129082,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 823,
                    "endIndex": 849
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2896590749368685,
                        "left": 0.2740247564489378,
                        "width": 0.008570011590277872,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 850,
                    "endIndex": 851
                },
                {
                    "text": "q",
                    "position": {
                        "top": 0.2896590749368685,
                        "left": 0.28259476803921574,
                        "width": 0.007266837464705882,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 852,
                    "endIndex": 853
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2896590749368685,
                        "left": 0.2898616055039216,
                        "width": 0.0104390455908497,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 854,
                    "endIndex": 855
                },
                {
                    "text": "=",
                    "position": {
                        "top": 0.2896590749368685,
                        "left": 0.3003006510947713,
                        "width": 0.012661617786846404,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 856,
                    "endIndex": 857
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2896590749368685,
                        "left": 0.3129622688816177,
                        "width": 0.00984864844566992,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 858,
                    "endIndex": 859
                },
                {
                    "text": "288",
                    "position": {
                        "top": 0.2896590749368685,
                        "left": 0.3228109173272876,
                        "width": 0.024418136642156862,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 860,
                    "endIndex": 863
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2896590749368685,
                        "left": 0.3472290539694444,
                        "width": 0.00858303431486936,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 864,
                    "endIndex": 865
                },
                {
                    "text": "and the number of",
                    "position": {
                        "top": 0.2896590749368685,
                        "left": 0.35581208828431377,
                        "width": 0.1324276943892974,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 866,
                    "endIndex": 883
                }
            ],
            [
                {
                    "text": "data items is 250. We divide the whole 250 data items into",
                    "position": {
                        "top": 0.3047537718055553,
                        "left": 0.08823528473856213,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 884,
                    "endIndex": 942
                }
            ],
            [
                {
                    "text": "training set and test set with a ratio of 3 to 2. The partially",
                    "position": {
                        "top": 0.31984846867424216,
                        "left": 0.08823528473856213,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 943,
                    "endIndex": 1006
                }
            ],
            [
                {
                    "text": "destroyed process is implemented by randomly setting some",
                    "position": {
                        "top": 0.33494316554292897,
                        "left": 0.08823528473856213,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1007,
                    "endIndex": 1064
                }
            ],
            [
                {
                    "text": "data missing according to the missing rate.",
                    "position": {
                        "top": 0.35003786241161583,
                        "left": 0.08823528473856213,
                        "width": 0.2878409947377451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1065,
                    "endIndex": 1108
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.37493558950757544,
                        "left": 0.08823528473856213,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1109,
                    "endIndex": 1109
                },
                {
                    "text": "B. Criterions",
                    "position": {
                        "top": 0.37493558950757544,
                        "left": 0.08823528473856213,
                        "width": 0.08909364122834967,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1110,
                    "endIndex": 1123
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.10451469699346408,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1124,
                    "endIndex": 1124
                },
                {
                    "text": "To",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.10451469699346408,
                        "width": 0.016783399252042478,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1125,
                    "endIndex": 1127
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.12129809624550657,
                        "width": 0.010239338631944452,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1128,
                    "endIndex": 1129
                },
                {
                    "text": "evaluate",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.131537434877451,
                        "width": 0.05342688297303923,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1130,
                    "endIndex": 1138
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.18496431785049025,
                        "width": 0.010223059874182996,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1139,
                    "endIndex": 1140
                },
                {
                    "text": "the",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.19518737772467326,
                        "width": 0.019892641984477124,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1141,
                    "endIndex": 1144
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.2150800197091504,
                        "width": 0.010239338631944452,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1145,
                    "endIndex": 1146
                },
                {
                    "text": "imputation",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.22531935834109482,
                        "width": 0.07055213613807189,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1147,
                    "endIndex": 1157
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.2958714944791666,
                        "width": 0.010239338631944452,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1158,
                    "endIndex": 1159
                },
                {
                    "text": "approach,",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.30611083311111104,
                        "width": 0.06373133663602942,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1160,
                    "endIndex": 1169
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.36984216974714035,
                        "width": 0.010223059874183019,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1170,
                    "endIndex": 1171
                },
                {
                    "text": "we",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.3800652296213234,
                        "width": 0.0189810315498366,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1172,
                    "endIndex": 1174
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.39904626117115993,
                        "width": 0.010239338631944452,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1175,
                    "endIndex": 1176
                },
                {
                    "text": "adopt",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.4092855998031044,
                        "width": 0.03617139974591504,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1177,
                    "endIndex": 1182
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.44545699954901946,
                        "width": 0.010239338631944452,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1183,
                    "endIndex": 1184
                },
                {
                    "text": "three",
                    "position": {
                        "top": 0.394532811603535,
                        "left": 0.45569633818096394,
                        "width": 0.03254123676511438,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1185,
                    "endIndex": 1190
                }
            ],
            [
                {
                    "text": "criterions to measure the error of the imputed data. They",
                    "position": {
                        "top": 0.4096287715909087,
                        "left": 0.08823528473856213,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1191,
                    "endIndex": 1248
                }
            ],
            [
                {
                    "text": "are root mean square error (RMSE),",
                    "position": {
                        "top": 0.4247234684595956,
                        "left": 0.08823528473856213,
                        "width": 0.24320464095588246,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1249,
                    "endIndex": 1283
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.45739644926767636,
                        "left": 0.18366665616013075,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1284,
                    "endIndex": 1284
                },
                {
                    "text": "RM SE",
                    "position": {
                        "top": 0.45739644926767636,
                        "left": 0.18366665616013075,
                        "width": 0.052984100761928096,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1285,
                    "endIndex": 1290
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.45739644926767636,
                        "left": 0.23665075692205886,
                        "width": 0.005466878568137255,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1291,
                    "endIndex": 1292
                },
                {
                    "text": "= [ ",
                    "position": {
                        "top": 0.45739644926767636,
                        "left": 0.24211763549019613,
                        "width": 0.02447385566993465,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1293,
                    "endIndex": 1297
                }
            ],
            [
                {
                    "text": "1",
                    "position": {
                        "top": 0.4488863485606057,
                        "left": 0.26659149116013076,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1298,
                    "endIndex": 1299
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.4660252657828283,
                        "left": 0.2657761417647059,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1300,
                    "endIndex": 1300
                },
                {
                    "text": "n",
                    "position": {
                        "top": 0.4660252657828283,
                        "left": 0.2657761417647059,
                        "width": 0.009770510408415034,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1301,
                    "endIndex": 1302
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.44167173030303036,
                        "left": 0.28794607611111117,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1303,
                    "endIndex": 1303
                },
                {
                    "text": "n",
                    "position": {
                        "top": 0.44167173030303036,
                        "left": 0.28794607611111117,
                        "width": 0.008047218431460786,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1304,
                    "endIndex": 1305
                },
                {
                    "text": "∑",
                    "position": {
                        "top": 0.4454457202904041,
                        "left": 0.2802124163071896,
                        "width": 0.02351466558639706,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1306,
                    "endIndex": 1307
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.472237386780303,
                        "left": 0.2814264685457517,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1308,
                    "endIndex": 1308
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.472237386780303,
                        "left": 0.2814264685457517,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1309,
                    "endIndex": 1310
                },
                {
                    "text": "=1",
                    "position": {
                        "top": 0.472237386780303,
                        "left": 0.2860310438235295,
                        "width": 0.016483009715531044,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1311,
                    "endIndex": 1313
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.45739647805555556,
                        "left": 0.30372712212418307,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1314,
                    "endIndex": 1314
                },
                {
                    "text": "(",
                    "position": {
                        "top": 0.45739647805555556,
                        "left": 0.30372712212418307,
                        "width": 0.006330808893423202,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1315,
                    "endIndex": 1316
                },
                {
                    "text": "x",
                    "position": {
                        "top": 0.45739647805555556,
                        "left": 0.3100571875980393,
                        "width": 0.009303310060661764,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1317,
                    "endIndex": 1318
                },
                {
                    "text": "r",
                    "position": {
                        "top": 0.4522020338257576,
                        "left": 0.31936110875817,
                        "width": 0.006043960147333333,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1319,
                    "endIndex": 1320
                }
            ],
            [
                {
                    "text": "i",
                    "position": {
                        "top": 0.46050632691919186,
                        "left": 0.31936110875817,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1321,
                    "endIndex": 1322
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.46050632691919186,
                        "left": 0.32396700749789875,
                        "width": 0.006220898498833298,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1323,
                    "endIndex": 1324
                },
                {
                    "text": "−",
                    "position": {
                        "top": 0.45739647838383835,
                        "left": 0.3301879059967321,
                        "width": 0.012661617786846404,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1325,
                    "endIndex": 1326
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.45739647838383835,
                        "left": 0.34284952378357847,
                        "width": 0.003616159827532681,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1327,
                    "endIndex": 1328
                },
                {
                    "text": "y",
                    "position": {
                        "top": 0.45739647838383835,
                        "left": 0.34646568361111113,
                        "width": 0.007981474930433007,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1329,
                    "endIndex": 1330
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.45928284195707064,
                        "left": 0.3544477101143791,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1331,
                    "endIndex": 1332
                },
                {
                    "text": ")",
                    "position": {
                        "top": 0.45739647838383835,
                        "left": 0.35986764459150333,
                        "width": 0.006330808893423202,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1333,
                    "endIndex": 1334
                },
                {
                    "text": "2",
                    "position": {
                        "top": 0.45220203415404037,
                        "left": 0.3661977100653595,
                        "width": 0.006489508491527778,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1335,
                    "endIndex": 1336
                },
                {
                    "text": "]",
                    "position": {
                        "top": 0.45739647838383835,
                        "left": 0.3734999974183007,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1337,
                    "endIndex": 1338
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.45739647838383835,
                        "left": 0.37802223632442816,
                        "width": 0.001953251355310447,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1339,
                    "endIndex": 1340
                }
            ],
            [
                {
                    "text": "1",
                    "position": {
                        "top": 0.4488219835858585,
                        "left": 0.3799754876797386,
                        "width": 0.005539661249535948,
                        "height": 0.006289520025252526
                    },
                    "startIndex": 1341,
                    "endIndex": 1342
                }
            ],
            [
                {
                    "text": "2",
                    "position": {
                        "top": 0.45523360281565656,
                        "left": 0.3799754871895425,
                        "width": 0.005539661249535948,
                        "height": 0.006289520025252526
                    },
                    "startIndex": 1343,
                    "endIndex": 1344
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.45523360281565656,
                        "left": 0.3855151484390784,
                        "width": 0.002767528456346408,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1345,
                    "endIndex": 1346
                },
                {
                    "text": ",",
                    "position": {
                        "top": 0.4573964816540404,
                        "left": 0.38828267689542484,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1347,
                    "endIndex": 1348
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.491251279280303,
                        "left": 0.08823529486928104,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1349,
                    "endIndex": 1349
                },
                {
                    "text": "mean absolute error (MAE),",
                    "position": {
                        "top": 0.491251279280303,
                        "left": 0.08823529486928104,
                        "width": 0.18932195276552288,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1350,
                    "endIndex": 1376
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5234330985353535,
                        "left": 0.20301961039215685,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1377,
                    "endIndex": 1377
                },
                {
                    "text": "M AE",
                    "position": {
                        "top": 0.5234330985353535,
                        "left": 0.20301961039215685,
                        "width": 0.04179245480093952,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1378,
                    "endIndex": 1382
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5234330985353535,
                        "left": 0.2448120651930964,
                        "width": 0.005462447274223857,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1383,
                    "endIndex": 1384
                },
                {
                    "text": "= ",
                    "position": {
                        "top": 0.5234330985353535,
                        "left": 0.25027451246732024,
                        "width": 0.019952615081699376,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1385,
                    "endIndex": 1387
                }
            ],
            [
                {
                    "text": "1",
                    "position": {
                        "top": 0.5149242603661616,
                        "left": 0.2702271275490196,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1388,
                    "endIndex": 1389
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.532061875479798,
                        "left": 0.269410127124183,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1390,
                    "endIndex": 1390
                },
                {
                    "text": "n",
                    "position": {
                        "top": 0.532061875479798,
                        "left": 0.269410127124183,
                        "width": 0.009770510408415034,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1391,
                    "endIndex": 1392
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5077096019444445,
                        "left": 0.291581696127451,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1393,
                    "endIndex": 1393
                },
                {
                    "text": "n",
                    "position": {
                        "top": 0.5077096019444445,
                        "left": 0.291581696127451,
                        "width": 0.008047218431460786,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1394,
                    "endIndex": 1395
                },
                {
                    "text": "∑",
                    "position": {
                        "top": 0.5114835919318181,
                        "left": 0.28384803632352945,
                        "width": 0.02351466558639706,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1396,
                    "endIndex": 1397
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5382752584217171,
                        "left": 0.2850604545915033,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1398,
                    "endIndex": 1398
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.5382752584217171,
                        "left": 0.2850604545915033,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1399,
                    "endIndex": 1400
                },
                {
                    "text": "=1",
                    "position": {
                        "top": 0.5382752584217171,
                        "left": 0.2896666637418301,
                        "width": 0.016483009715531044,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1401,
                    "endIndex": 1403
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5234330865782828,
                        "left": 0.3100751600980392,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1404,
                    "endIndex": 1404
                },
                {
                    "text": "|",
                    "position": {
                        "top": 0.5234330865782828,
                        "left": 0.3100751600980392,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1405,
                    "endIndex": 1406
                },
                {
                    "text": "x",
                    "position": {
                        "top": 0.5234330865782828,
                        "left": 0.31459640184640525,
                        "width": 0.009303310060661764,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1407,
                    "endIndex": 1408
                },
                {
                    "text": "r",
                    "position": {
                        "top": 0.5182399048737374,
                        "left": 0.323900323006536,
                        "width": 0.006043960147333333,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1409,
                    "endIndex": 1410
                }
            ],
            [
                {
                    "text": "i",
                    "position": {
                        "top": 0.5265429354419192,
                        "left": 0.323900323006536,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1411,
                    "endIndex": 1412
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5265429354419192,
                        "left": 0.32850622174626476,
                        "width": 0.006220898498833298,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1413,
                    "endIndex": 1414
                },
                {
                    "text": "−",
                    "position": {
                        "top": 0.5234330869065656,
                        "left": 0.33472712024509804,
                        "width": 0.012661617786846404,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1415,
                    "endIndex": 1416
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5234330869065656,
                        "left": 0.3473887380319444,
                        "width": 0.0036177944680555723,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1417,
                    "endIndex": 1418
                },
                {
                    "text": "y",
                    "position": {
                        "top": 0.5234330869065656,
                        "left": 0.3510065325,
                        "width": 0.007981474930433007,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1419,
                    "endIndex": 1420
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.5253207131691919,
                        "left": 0.3589869243464052,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1421,
                    "endIndex": 1422
                },
                {
                    "text": "|",
                    "position": {
                        "top": 0.5234330869065656,
                        "left": 0.36440685882352947,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1423,
                    "endIndex": 1424
                },
                {
                    "text": ",",
                    "position": {
                        "top": 0.5234330869065656,
                        "left": 0.3689281005718955,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1425,
                    "endIndex": 1426
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5572891464520202,
                        "left": 0.08823529570261443,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1427,
                    "endIndex": 1427
                },
                {
                    "text": "and mean relative error (MRE),",
                    "position": {
                        "top": 0.5572891464520202,
                        "left": 0.08823529570261443,
                        "width": 0.2115424571098857,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1428,
                    "endIndex": 1458
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5894709657070707,
                        "left": 0.20092810993464058,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1459,
                    "endIndex": 1459
                },
                {
                    "text": "M RE",
                    "position": {
                        "top": 0.5894709657070707,
                        "left": 0.20092810993464058,
                        "width": 0.042074077310212406,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1460,
                    "endIndex": 1464
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5894709657070707,
                        "left": 0.24300218724485295,
                        "width": 0.005456969585212492,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1465,
                    "endIndex": 1466
                },
                {
                    "text": "= ",
                    "position": {
                        "top": 0.5894709657070707,
                        "left": 0.24845915683006545,
                        "width": 0.019952615081699376,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1467,
                    "endIndex": 1469
                }
            ],
            [
                {
                    "text": "1",
                    "position": {
                        "top": 0.580960865,
                        "left": 0.2684117719117648,
                        "width": 0.008139378880718955,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1470,
                    "endIndex": 1471
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5980997567424242,
                        "left": 0.26759478,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1472,
                    "endIndex": 1472
                },
                {
                    "text": "n",
                    "position": {
                        "top": 0.5980997567424242,
                        "left": 0.26759478,
                        "width": 0.009770510408415034,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1473,
                    "endIndex": 1474
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5737474832070708,
                        "left": 0.289766349003268,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1475,
                    "endIndex": 1475
                },
                {
                    "text": "n",
                    "position": {
                        "top": 0.5737474832070708,
                        "left": 0.289766349003268,
                        "width": 0.008047218431460786,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1476,
                    "endIndex": 1477
                },
                {
                    "text": "∑",
                    "position": {
                        "top": 0.5775214731944445,
                        "left": 0.28203268919934643,
                        "width": 0.02351466558639706,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1478,
                    "endIndex": 1479
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6043131396843434,
                        "left": 0.2832467414379085,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1480,
                    "endIndex": 1480
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.6043131396843434,
                        "left": 0.2832467414379085,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1481,
                    "endIndex": 1482
                },
                {
                    "text": "=1",
                    "position": {
                        "top": 0.6043131396843434,
                        "left": 0.2878513167156863,
                        "width": 0.016483009715531044,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1483,
                    "endIndex": 1485
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5809608659217173,
                        "left": 0.31021406158496734,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1486,
                    "endIndex": 1486
                },
                {
                    "text": "|",
                    "position": {
                        "top": 0.5809608659217173,
                        "left": 0.31021406158496734,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1487,
                    "endIndex": 1488
                },
                {
                    "text": "x",
                    "position": {
                        "top": 0.5809608659217173,
                        "left": 0.3147353033333334,
                        "width": 0.009303310060661764,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1489,
                    "endIndex": 1490
                },
                {
                    "text": "r",
                    "position": {
                        "top": 0.5763964719823232,
                        "left": 0.3240392244934641,
                        "width": 0.006043960147333333,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1491,
                    "endIndex": 1492
                }
            ],
            [
                {
                    "text": "i",
                    "position": {
                        "top": 0.5842361185732324,
                        "left": 0.3240392244934641,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1493,
                    "endIndex": 1494
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5842361185732324,
                        "left": 0.3286451232331929,
                        "width": 0.006220898498833298,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1495,
                    "endIndex": 1496
                },
                {
                    "text": "−",
                    "position": {
                        "top": 0.5809608659217173,
                        "left": 0.3348660217320262,
                        "width": 0.012661617786846404,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1497,
                    "endIndex": 1498
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5809608659217173,
                        "left": 0.34752763951887256,
                        "width": 0.003616159827532681,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1499,
                    "endIndex": 1500
                },
                {
                    "text": "y",
                    "position": {
                        "top": 0.5809608659217173,
                        "left": 0.35114379934640527,
                        "width": 0.007981474930433007,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1501,
                    "endIndex": 1502
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.5828484921843435,
                        "left": 0.35912582584967323,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1503,
                    "endIndex": 1504
                },
                {
                    "text": "|",
                    "position": {
                        "top": 0.5809608659217173,
                        "left": 0.3645457603267974,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1505,
                    "endIndex": 1506
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5980997567424242,
                        "left": 0.3313839980882353,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1507,
                    "endIndex": 1507
                },
                {
                    "text": "x",
                    "position": {
                        "top": 0.5980997567424242,
                        "left": 0.3313839980882353,
                        "width": 0.009303310060661764,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1508,
                    "endIndex": 1509
                },
                {
                    "text": "r",
                    "position": {
                        "top": 0.5937676860353536,
                        "left": 0.340687919248366,
                        "width": 0.006043960147333333,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1510,
                    "endIndex": 1511
                }
            ],
            [
                {
                    "text": "i",
                    "position": {
                        "top": 0.6016060700883838,
                        "left": 0.340687919248366,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1512,
                    "endIndex": 1513
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5894709690025253,
                        "left": 0.37102125120915036,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1514,
                    "endIndex": 1514
                },
                {
                    "text": ",",
                    "position": {
                        "top": 0.5894709690025253,
                        "left": 0.37102125120915036,
                        "width": 0.004522238906127451,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1515,
                    "endIndex": 1516
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6233257666287879,
                        "left": 0.08823529950980392,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1517,
                    "endIndex": 1517
                },
                {
                    "text": "where",
                    "position": {
                        "top": 0.6233257666287879,
                        "left": 0.08823529950980392,
                        "width": 0.039769005211192816,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1518,
                    "endIndex": 1523
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.6233257666287879,
                        "left": 0.12800430472099675,
                        "width": 0.006797989135212399,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1524,
                    "endIndex": 1525
                },
                {
                    "text": "n",
                    "position": {
                        "top": 0.6233257666287879,
                        "left": 0.13480229385620915,
                        "width": 0.009770510408415034,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1526,
                    "endIndex": 1527
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.6233257666287879,
                        "left": 0.14457280426462418,
                        "width": 0.006799750702696084,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1528,
                    "endIndex": 1529
                },
                {
                    "text": "is the total number of the missing data,",
                    "position": {
                        "top": 0.6233257666287879,
                        "left": 0.15137255496732027,
                        "width": 0.2723110598333333,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1530,
                    "endIndex": 1570
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.6233257666287879,
                        "left": 0.4236836148006534,
                        "width": 0.006803308058823762,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1571,
                    "endIndex": 1572
                },
                {
                    "text": "y",
                    "position": {
                        "top": 0.6233257666287879,
                        "left": 0.4304869228594772,
                        "width": 0.007981474930433007,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1573,
                    "endIndex": 1574
                },
                {
                    "text": "i",
                    "position": {
                        "top": 0.6252133928914142,
                        "left": 0.43846894936274516,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1575,
                    "endIndex": 1576
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.6252133928914142,
                        "left": 0.4430748481024739,
                        "width": 0.007611421881186268,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1577,
                    "endIndex": 1578
                },
                {
                    "text": "is the",
                    "position": {
                        "top": 0.6233257666287879,
                        "left": 0.4506862699836601,
                        "width": 0.03755509415563727,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1579,
                    "endIndex": 1585
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6384217266161616,
                        "left": 0.08823527763071898,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1586,
                    "endIndex": 1586
                },
                {
                    "text": "ith",
                    "position": {
                        "top": 0.6384217266161616,
                        "left": 0.08823527763071898,
                        "width": 0.020866111698611113,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1587,
                    "endIndex": 1590
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.6384217266161616,
                        "left": 0.10910138932933008,
                        "width": 0.005697613726225491,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1591,
                    "endIndex": 1592
                },
                {
                    "text": "imputed data and",
                    "position": {
                        "top": 0.6384217266161616,
                        "left": 0.11479900305555557,
                        "width": 0.11538383501307191,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1593,
                    "endIndex": 1609
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.6384217266161616,
                        "left": 0.23018283806862744,
                        "width": 0.0056978600359477855,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1610,
                    "endIndex": 1611
                },
                {
                    "text": "x",
                    "position": {
                        "top": 0.6384217266161616,
                        "left": 0.2358806981045752,
                        "width": 0.009303310060661764,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1612,
                    "endIndex": 1613
                },
                {
                    "text": "r",
                    "position": {
                        "top": 0.6338560701388889,
                        "left": 0.24518298539215694,
                        "width": 0.006043960147333333,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1614,
                    "endIndex": 1615
                }
            ],
            [
                {
                    "text": "i",
                    "position": {
                        "top": 0.6416957167297981,
                        "left": 0.24518298539215694,
                        "width": 0.004605898739728758,
                        "height": 0.008805303244949495
                    },
                    "startIndex": 1616,
                    "endIndex": 1617
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.6416957167297981,
                        "left": 0.2497888841318857,
                        "width": 0.008300964250467311,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1618,
                    "endIndex": 1619
                },
                {
                    "text": "is the corresponding raw data.",
                    "position": {
                        "top": 0.6384217269318182,
                        "left": 0.25808984838235305,
                        "width": 0.20201938381944445,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1620,
                    "endIndex": 1650
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6633181920833334,
                        "left": 0.08823527910130728,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1651,
                    "endIndex": 1651
                },
                {
                    "text": "C. Structure setting of DSAE",
                    "position": {
                        "top": 0.6633181920833334,
                        "left": 0.08823527910130728,
                        "width": 0.1960125222054739,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1652,
                    "endIndex": 1680
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6829166773106062,
                        "left": 0.10451469135620924,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1681,
                    "endIndex": 1681
                },
                {
                    "text": "The structure of DSAE includes the number of layers, the",
                    "position": {
                        "top": 0.6829166773106062,
                        "left": 0.10451469135620924,
                        "width": 0.3837228779526141,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1682,
                    "endIndex": 1738
                }
            ],
            [
                {
                    "text": "number of nodes in each layer and the activation functions",
                    "position": {
                        "top": 0.698011374179293,
                        "left": 0.08823527910130728,
                        "width": 0.4000016357140519,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1739,
                    "endIndex": 1797
                }
            ],
            [
                {
                    "text": "of each layer. The input layer and output layer have been",
                    "position": {
                        "top": 0.7131060710479799,
                        "left": 0.08823527910130728,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1798,
                    "endIndex": 1855
                }
            ],
            [
                {
                    "text": "decided",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.08823527910130728,
                        "width": 0.0506269366380719,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1856,
                    "endIndex": 1863
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.13886221573937918,
                        "width": 0.010027714781045752,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1864,
                    "endIndex": 1865
                },
                {
                    "text": "to",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.14888993052042493,
                        "width": 0.012664873538398694,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1866,
                    "endIndex": 1868
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.16155480405882364,
                        "width": 0.01001143602328432,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1869,
                    "endIndex": 1870
                },
                {
                    "text": "contain",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.17156624008210794,
                        "width": 0.04792466284967321,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1871,
                    "endIndex": 1878
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.21949090293178117,
                        "width": 0.010023783734885617,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1879,
                    "endIndex": 1880
                },
                {
                    "text": "q",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.22951468666666677,
                        "width": 0.007266837464705882,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1881,
                    "endIndex": 1882
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.23678152413137266,
                        "width": 0.013113880786928132,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1883,
                    "endIndex": 1884
                },
                {
                    "text": "=",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.24989540491830078,
                        "width": 0.012661617786846404,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1885,
                    "endIndex": 1886
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.2625570227051472,
                        "width": 0.012534643476307209,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1887,
                    "endIndex": 1888
                },
                {
                    "text": "288",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.2750916661814544,
                        "width": 0.024418136642156862,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1889,
                    "endIndex": 1892
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.2995098028236112,
                        "width": 0.010014687094689596,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1893,
                    "endIndex": 1894
                },
                {
                    "text": "nodes.",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.30952448991830084,
                        "width": 0.04204803129779412,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1895,
                    "endIndex": 1901
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.3515725212160949,
                        "width": 0.01002771478104573,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1902,
                    "endIndex": 1903
                },
                {
                    "text": "A",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.3616002359971406,
                        "width": 0.01175326310375817,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1904,
                    "endIndex": 1905
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.37335349910089877,
                        "width": 0.010011436023284297,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1906,
                    "endIndex": 1907
                },
                {
                    "text": "typical",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.38336493512418307,
                        "width": 0.04431077862663399,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1908,
                    "endIndex": 1915
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.4276757137508171,
                        "width": 0.01002771478104573,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1916,
                    "endIndex": 1917
                },
                {
                    "text": "way",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.4377034285318628,
                        "width": 0.02695762285294113,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1918,
                    "endIndex": 1921
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.4646610513848039,
                        "width": 0.010011436023284297,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1922,
                    "endIndex": 1923
                },
                {
                    "text": "of",
                    "position": {
                        "top": 0.7282007679166667,
                        "left": 0.4746724874080882,
                        "width": 0.013560205215277779,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1924,
                    "endIndex": 1926
                }
            ],
            [
                {
                    "text": "setting hidden layers for the purpose of restoring data is to",
                    "position": {
                        "top": 0.7432954647853536,
                        "left": 0.0882352728594773,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1927,
                    "endIndex": 1988
                }
            ],
            [
                {
                    "text": "choose decreasing number of nodes then increasing number",
                    "position": {
                        "top": 0.7583901616540405,
                        "left": 0.0882352728594773,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1989,
                    "endIndex": 2045
                }
            ],
            [
                {
                    "text": "of nodes in symmetry. Therefore a reasonable set of the",
                    "position": {
                        "top": 0.7734861216414143,
                        "left": 0.0882352728594773,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2046,
                    "endIndex": 2101
                }
            ],
            [
                {
                    "text": "architecture of hidden layers is three layers with 144, 72,",
                    "position": {
                        "top": 0.7885808185101012,
                        "left": 0.0882352728594773,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2102,
                    "endIndex": 2161
                }
            ],
            [
                {
                    "text": "144 nodes respectively. We choose the sigmoid function as",
                    "position": {
                        "top": 0.803675515378788,
                        "left": 0.0882352728594773,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2162,
                    "endIndex": 2219
                }
            ],
            [
                {
                    "text": "the activation function of each layer.",
                    "position": {
                        "top": 0.8187702122474748,
                        "left": 0.0882352728594773,
                        "width": 0.24512553437173204,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2220,
                    "endIndex": 2258
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.8436679393434345,
                        "left": 0.0882352728594773,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2259,
                    "endIndex": 2259
                },
                {
                    "text": "D. Results and Analysis",
                    "position": {
                        "top": 0.8436679393434345,
                        "left": 0.0882352728594773,
                        "width": 0.16197363972630716,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2260,
                    "endIndex": 2283
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.8632651614393941,
                        "left": 0.10451468511437927,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2284,
                    "endIndex": 2284
                },
                {
                    "text": "We divide the dataset into training set and test set. Then we",
                    "position": {
                        "top": 0.8632651614393941,
                        "left": 0.10451468511437927,
                        "width": 0.38372287795261417,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2285,
                    "endIndex": 2346
                }
            ],
            [
                {
                    "text": "conduct series of experiments with the missing rate ranging",
                    "position": {
                        "top": 0.8783598583080809,
                        "left": 0.0882352728594773,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2347,
                    "endIndex": 2406
                }
            ],
            [
                {
                    "text": "from 0.01 to 0.90 and obtain the imputation results of the test",
                    "position": {
                        "top": 0.8934545551767678,
                        "left": 0.0882352728594773,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2407,
                    "endIndex": 2470
                }
            ],
            [
                {
                    "text": "set. Apart from the deep learning approach, we also conduct",
                    "position": {
                        "top": 0.9085505151641415,
                        "left": 0.0882352728594773,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2471,
                    "endIndex": 2530
                }
            ],
            [
                {
                    "text": "experiments with artificial neural networks with the same",
                    "position": {
                        "top": 0.9236452120328283,
                        "left": 0.0882352728594773,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2531,
                    "endIndex": 2588
                }
            ],
            [
                {
                    "text": "set of layers and nodes for contrast. All the experiments are",
                    "position": {
                        "top": 0.0783295678156567,
                        "left": 0.5117647045588236,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2589,
                    "endIndex": 2650
                }
            ],
            [
                {
                    "text": "conducted on a computer with Core i5 CPU and 4G RAM.",
                    "position": {
                        "top": 0.09342552780303047,
                        "left": 0.5117647045588236,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2651,
                    "endIndex": 2703
                }
            ],
            [
                {
                    "text": "Each experiment with a certain missing rate and using a",
                    "position": {
                        "top": 0.10852022467171732,
                        "left": 0.5117647045588236,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2704,
                    "endIndex": 2759
                }
            ],
            [
                {
                    "text": "certain network costs less than 1 second. The RMSE, MAE,",
                    "position": {
                        "top": 0.12361492154040415,
                        "left": 0.5117647045588236,
                        "width": 0.4000016357140517,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2760,
                    "endIndex": 2816
                }
            ],
            [
                {
                    "text": "MRE of the imputed data under different missing rates are",
                    "position": {
                        "top": 0.138709618409091,
                        "left": 0.5117647045588236,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2817,
                    "endIndex": 2874
                }
            ],
            [
                {
                    "text": "shown in Fig. 6, 7, 8 respectively. The RMSE of our deep",
                    "position": {
                        "top": 0.15380431527777783,
                        "left": 0.5117647045588236,
                        "width": 0.4000016357140525,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2875,
                    "endIndex": 2931
                }
            ],
            [
                {
                    "text": "learning based approach ranges from 16.9 to 20.3 veh/5-",
                    "position": {
                        "top": 0.1688990121464647,
                        "left": 0.5117647045588236,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2932,
                    "endIndex": 2987
                }
            ],
            [
                {
                    "text": "minute while the MAE ranges from 11.3 to 13.8 veh/5-",
                    "position": {
                        "top": 0.18399497213383845,
                        "left": 0.5117647045588236,
                        "width": 0.40000163571405245,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2988,
                    "endIndex": 3040
                }
            ],
            [
                {
                    "text": "minute and the MRE ranges from 0.24 to 0.35 under all the",
                    "position": {
                        "top": 0.1990896690025253,
                        "left": 0.5117647045588236,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3041,
                    "endIndex": 3098
                }
            ],
            [
                {
                    "text": "experimented missing rates. Both the RMSE and the MAE",
                    "position": {
                        "top": 0.21418436587121215,
                        "left": 0.5117647045588236,
                        "width": 0.40000163571405184,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3099,
                    "endIndex": 3152
                }
            ],
            [
                {
                    "text": "of our approach are smaller than the neural network method",
                    "position": {
                        "top": 0.22927906273989898,
                        "left": 0.5117647045588236,
                        "width": 0.4000016357140522,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3153,
                    "endIndex": 3211
                }
            ],
            [
                {
                    "text": "with most missing rates. Additionally, the error fluctuation",
                    "position": {
                        "top": 0.24437375960858582,
                        "left": 0.5117647045588236,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3212,
                    "endIndex": 3272
                }
            ],
            [
                {
                    "text": "of our approach is smaller than the neural network which",
                    "position": {
                        "top": 0.2594697195959596,
                        "left": 0.5117647045588236,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3273,
                    "endIndex": 3329
                }
            ],
            [
                {
                    "text": "can be seen obviously from the contrast of MRE.",
                    "position": {
                        "top": 0.27456441646464647,
                        "left": 0.5117647045588236,
                        "width": 0.33242851224632325,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3330,
                    "endIndex": 3377
                }
            ],
            [
                {
                    "text": "0",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.565142210708206,
                        "width": 0.0039447785088894535,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3378,
                    "endIndex": 3379
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.5690869892170954,
                        "width": 0.0847715873913725,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3380,
                    "endIndex": 3381
                },
                {
                    "text": "10",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.5973317897706519,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3382,
                    "endIndex": 3384
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.6050895963283132,
                        "width": 0.07988628793634,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3385,
                    "endIndex": 3386
                },
                {
                    "text": "20",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.6317066780553394,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3387,
                    "endIndex": 3389
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.6394644846130004,
                        "width": 0.07986996955398716,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3390,
                    "endIndex": 3391
                },
                {
                    "text": "30",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.6660761292653051,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3392,
                    "endIndex": 3394
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.6738339358229662,
                        "width": 0.07986996952130736,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3395,
                    "endIndex": 3396
                },
                {
                    "text": "40",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.7004455804643824,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3397,
                    "endIndex": 3399
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.7082033870220434,
                        "width": 0.07988627548535948,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3400,
                    "endIndex": 3401
                },
                {
                    "text": "50",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.7348204646005635,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3402,
                    "endIndex": 3404
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.7425782711582246,
                        "width": 0.07986996953764726,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3405,
                    "endIndex": 3406
                },
                {
                    "text": "60",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.769189915805085,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3407,
                    "endIndex": 3409
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.7769477223627461,
                        "width": 0.07986996950496719,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3410,
                    "endIndex": 3411
                },
                {
                    "text": "70",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.803559366998718,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3412,
                    "endIndex": 3414
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.8113171735563792,
                        "width": 0.07988627550169909,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3415,
                    "endIndex": 3416
                },
                {
                    "text": "80",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.8379342511403434,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3417,
                    "endIndex": 3419
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.8456920576980046,
                        "width": 0.07986996953764698,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3420,
                    "endIndex": 3421
                },
                {
                    "text": "90",
                    "position": {
                        "top": 0.5145502553399917,
                        "left": 0.872303702344865,
                        "width": 0.007757806557661275,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3422,
                    "endIndex": 3424
                },
                {
                    "text": "15",
                    "position": {
                        "top": 0.5099183387074464,
                        "left": 0.5569578933745354,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3425,
                    "endIndex": 3427
                }
            ],
            [
                {
                    "text": "16",
                    "position": {
                        "top": 0.4762465095835193,
                        "left": 0.5569578933745354,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3428,
                    "endIndex": 3430
                }
            ],
            [
                {
                    "text": "17",
                    "position": {
                        "top": 0.44300035763415874,
                        "left": 0.5569578933745354,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3431,
                    "endIndex": 3433
                }
            ],
            [
                {
                    "text": "18",
                    "position": {
                        "top": 0.40974999532681294,
                        "left": 0.5569578933745354,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3434,
                    "endIndex": 3436
                }
            ],
            [
                {
                    "text": "19",
                    "position": {
                        "top": 0.37607480466078974,
                        "left": 0.5569578933745354,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3437,
                    "endIndex": 3439
                }
            ],
            [
                {
                    "text": "20",
                    "position": {
                        "top": 0.34283285664647944,
                        "left": 0.5569578933745354,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3440,
                    "endIndex": 3442
                }
            ],
            [
                {
                    "text": "21",
                    "position": {
                        "top": 0.3095782775750385,
                        "left": 0.5569578933745354,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3443,
                    "endIndex": 3445
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5238039927523278,
                        "left": 0.6835357913330327,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3446,
                    "endIndex": 3446
                },
                {
                    "text": "missing rate (%)",
                    "position": {
                        "top": 0.5238039927523278,
                        "left": 0.6835357913330327,
                        "width": 0.07429305759784341,
                        "height": 0.008006585916510009
                    },
                    "startIndex": 3447,
                    "endIndex": 3463
                }
            ],
            [
                {
                    "text": "RMSE of imputed data (veh/5-minute)",
                    "position": {
                        "top": 0.4749846363000189,
                        "left": 0.5493316108638046,
                        "width": 0.17611870646342642,
                        "height": 0.00800784932071149
                    },
                    "startIndex": 3464,
                    "endIndex": 3499
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.3222012335928662,
                        "left": 0.6022479323083704,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3500,
                    "endIndex": 3500
                },
                {
                    "text": "NN",
                    "position": {
                        "top": 0.3222012335928662,
                        "left": 0.6022479323083704,
                        "width": 0.014576685672249368,
                        "height": 0.008006585916510009
                    },
                    "startIndex": 3501,
                    "endIndex": 3503
                }
            ],
            [
                {
                    "text": "Deep learning",
                    "position": {
                        "top": 0.3327252521630094,
                        "left": 0.6022479323083704,
                        "width": 0.06407504186462101,
                        "height": 0.008006585916510009
                    },
                    "startIndex": 3504,
                    "endIndex": 3517
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5543106156186869,
                        "left": 0.602625828137255,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3518,
                    "endIndex": 3518
                },
                {
                    "text": "Fig. 6.",
                    "position": {
                        "top": 0.5543106156186869,
                        "left": 0.602625828137255,
                        "width": 0.0349538369040523,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3519,
                    "endIndex": 3526
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.5543106156186869,
                        "left": 0.6375796650413074,
                        "width": 0.013674191039215655,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3527,
                    "endIndex": 3528
                },
                {
                    "text": "The RMSE of the imputed data",
                    "position": {
                        "top": 0.5543106156186869,
                        "left": 0.651253856080523,
                        "width": 0.16965113015986938,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3529,
                    "endIndex": 3557
                }
            ],
            [
                {
                    "text": "0",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.5626321138115534,
                        "width": 0.0039447785088894535,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3558,
                    "endIndex": 3559
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.5665768923204428,
                        "width": 0.08477648668875813,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3560,
                    "endIndex": 3561
                },
                {
                    "text": "10",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.594823325256756,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3562,
                    "endIndex": 3564
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.6025811318144171,
                        "width": 0.07988628793633973,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3565,
                    "endIndex": 3566
                },
                {
                    "text": "20",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.6291982135414432,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3567,
                    "endIndex": 3569
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.6369560200991045,
                        "width": 0.07986996955398688,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3570,
                    "endIndex": 3571
                },
                {
                    "text": "30",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.663567664751409,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3572,
                    "endIndex": 3574
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.6713254713090702,
                        "width": 0.07986996952130736,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3575,
                    "endIndex": 3576
                },
                {
                    "text": "40",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.6979371159504864,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3577,
                    "endIndex": 3579
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.7056949225081475,
                        "width": 0.07986996952130736,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3580,
                    "endIndex": 3581
                },
                {
                    "text": "50",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.7323065671495637,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3582,
                    "endIndex": 3584
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.7400643737072247,
                        "width": 0.07988627550169965,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3585,
                    "endIndex": 3586
                },
                {
                    "text": "60",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.766681451291189,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3587,
                    "endIndex": 3589
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.7744392578488501,
                        "width": 0.07986996950496719,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3590,
                    "endIndex": 3591
                },
                {
                    "text": "70",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.8010509024848219,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3592,
                    "endIndex": 3594
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.8088087090424833,
                        "width": 0.0798699196683658,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3595,
                    "endIndex": 3596
                },
                {
                    "text": "80",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.8354203370735417,
                        "width": 0.007757806557661089,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3597,
                    "endIndex": 3599
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.8431781436312029,
                        "width": 0.08152031229908482,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3600,
                    "endIndex": 3601
                },
                {
                    "text": "90",
                    "position": {
                        "top": 0.8057631380800143,
                        "left": 0.8703396612198853,
                        "width": 0.007757806557661275,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3602,
                    "endIndex": 3604
                },
                {
                    "text": "10",
                    "position": {
                        "top": 0.8011413156976444,
                        "left": 0.5544477964996597,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3605,
                    "endIndex": 3607
                }
            ],
            [
                {
                    "text": "11",
                    "position": {
                        "top": 0.7619938003295778,
                        "left": 0.5544477964996597,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3608,
                    "endIndex": 3610
                }
            ],
            [
                {
                    "text": "12",
                    "position": {
                        "top": 0.7232711165295529,
                        "left": 0.5544477964996597,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3611,
                    "endIndex": 3613
                }
            ],
            [
                {
                    "text": "13",
                    "position": {
                        "top": 0.6841362225863178,
                        "left": 0.5544477964996597,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3614,
                    "endIndex": 3616
                }
            ],
            [
                {
                    "text": "14",
                    "position": {
                        "top": 0.6454093284367202,
                        "left": 0.5544477964996597,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3617,
                    "endIndex": 3619
                }
            ],
            [
                {
                    "text": "15",
                    "position": {
                        "top": 0.6066824471245803,
                        "left": 0.5544477964996597,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 3620,
                    "endIndex": 3622
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.8150269697509381,
                        "left": 0.6815717502080529,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3623,
                    "endIndex": 3623
                },
                {
                    "text": "missing rate (%)",
                    "position": {
                        "top": 0.8150269697509381,
                        "left": 0.6815717502080529,
                        "width": 0.0742930575978435,
                        "height": 0.008006585916510009
                    },
                    "startIndex": 3624,
                    "endIndex": 3640
                }
            ],
            [
                {
                    "text": "MAE of imputed data (veh/5-minute)",
                    "position": {
                        "top": 0.7640969224687449,
                        "left": 0.5506351993546397,
                        "width": 0.1684914884003402,
                        "height": 0.00800784932071149
                    },
                    "startIndex": 3641,
                    "endIndex": 3675
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.6210004934069125,
                        "left": 0.6002838911833908,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3676,
                    "endIndex": 3676
                },
                {
                    "text": "NN",
                    "position": {
                        "top": 0.6210004934069125,
                        "left": 0.6002838911833908,
                        "width": 0.014576685672249368,
                        "height": 0.008006585916510009
                    },
                    "startIndex": 3677,
                    "endIndex": 3679
                }
            ],
            [
                {
                    "text": "Deep learning",
                    "position": {
                        "top": 0.6315245119686432,
                        "left": 0.6002838911833908,
                        "width": 0.06407504186462092,
                        "height": 0.008006585916510009
                    },
                    "startIndex": 3680,
                    "endIndex": 3693
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.8486489864393939,
                        "left": 0.6058872696405229,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3694,
                    "endIndex": 3694
                },
                {
                    "text": "Fig. 7.",
                    "position": {
                        "top": 0.8486489864393939,
                        "left": 0.6058872696405229,
                        "width": 0.0349538369040523,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3695,
                    "endIndex": 3702
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8486489864393939,
                        "left": 0.6408411065445753,
                        "width": 0.013674191039215655,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3703,
                    "endIndex": 3704
                },
                {
                    "text": "The MAE of the imputed data",
                    "position": {
                        "top": 0.8486489864393939,
                        "left": 0.6545152975837909,
                        "width": 0.16312658757830073,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3705,
                    "endIndex": 3732
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.8783598451767677,
                        "left": 0.5280441334150326,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3733,
                    "endIndex": 3733
                },
                {
                    "text": "Fig. 9 displays the imputed data of one period with the",
                    "position": {
                        "top": 0.8783598451767677,
                        "left": 0.5280441334150326,
                        "width": 0.3837228779526141,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3734,
                    "endIndex": 3789
                }
            ],
            [
                {
                    "text": "deep learning based approach under the missing rate of",
                    "position": {
                        "top": 0.8934545420454546,
                        "left": 0.5117647211601307,
                        "width": 0.40000163571405245,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3790,
                    "endIndex": 3844
                }
            ],
            [
                {
                    "text": "0.30. From that figure, we can see that the imputed data",
                    "position": {
                        "top": 0.9085505020328283,
                        "left": 0.5117647211601307,
                        "width": 0.4000016357140519,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3845,
                    "endIndex": 3901
                }
            ],
            [
                {
                    "text": "are quite consistent with the observed data. Considering",
                    "position": {
                        "top": 0.9236451989015152,
                        "left": 0.5117647211601307,
                        "width": 0.40000163571405234,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 3902,
                    "endIndex": 3958
                }
            ],
            [
                {
                    "text": "915",
                    "position": {
                        "top": 0.954040404040404,
                        "left": 0.48909803921568623,
                        "width": 0.021803921568627455,
                        "height": 0.010101010101010102
                    },
                    "startIndex": 3959,
                    "endIndex": 3962
                }
            ]
        ],
        "page": 4
    },
    {
        "id": "page_5",
        "block_type": "Page",
        "text": "0   10   20   30   40   50   60   70   80   90 0.2 0.25 0.3 0.35 0.4 0.45  missing rate (%) MRE of imputed data  NN Deep learning Fig. 8.   The MRE of the imputed data  the statistical properties of the imputed data, we give the distribution of the imputation error under the missing rate of 0.3. Fig. 10 presents the empirical cumulative distribution of the absolute imputation error. 80% of the absolute error are under 20 veh/5-minute and 95% of the absolute error are under 40 veh/5-minute with the maximum flow to be 321 veh/5-minute. That illustrates our approach has a good performance. 50   100   150   200   250 0 50 100 150 200 250 300  time interval flow (veh/5-minute) Detector station 500010092  Observed Imputed  Fig. 9.   The imputed traffic data of one period  V. CONCLUSIONS AND FUTURE WORKS  A. Conclusions  This paper proposes a deep learning based approach for traffic data imputation. The imputation model is constructed using a DAE filled with SAE in the middle layers. The approach treats the traffic data including observed data and missing data as a whole data item and restores the complete data with a deep structural network. The deep learning 0   20   40   60   80   100   120 0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1  absolute error cumulative probability Empirical CDF  Fig. 10.   The empirical cumulative distribution of the absolute imputation error  approach   can   discover   the   correlations   contained   in   the data structure by a layer-wise pre-training and improve the imputation accuracy by conducting a fine-tuning afterwards. We conduct a series of experiments using the data collected from Caltrans PeMS to evaluate the proposed approach. The results show that our approach is fairly good. Deep learning is promising in the field of traffic data imputation.  B. Future Works  There are still many works to do about the deep learning based traffic data imputation approach. As have been de- scribed in the paper, the traffic data structures and imputation patterns can be various in real practise. This paper only tests the performance of the approach in one pattern using one type of traffic data. More experiments are expected to be done in the future. The architecture of the deep network in our approach is relatively simple. It can be more complex and powerful according to the need of applications. Large scale deep networks deserve to be investigated in the field of traffic data imputation. VI. ACKNOWLEDGMENTS The authors would like to thank Prof. F.-Y. Wang for his instruction and encouragement. R EFERENCES [1]   F.-Y. Wang, Parallel control and management for intelligent trans- portation systems: Concepts, architectures, and applications, Intelligent Transportation Systems, IEEE Transactions on, vol. 11, no. 3, pp. 630- 638, 2010. [2]   B. L. Smith, W. T. Scherer, J. H. Conklin et al., ”Exploring imputation techniques for missing data in transportation management systems,” Initiatives   in Information   Technology   and   Geospatial   Science   for Transportation: Planning and Administration, Transportation Research Record   1836,   pp.   132-142,   Washington:   Transportation   Research Board Natl Research Council, 2003. [3]   Y. B. Li, Z. H. Li, and L. Li, Missing traffic data: comparison of imputation methods, Iet Intelligent Transport Systems, vol. 8, no. 1, pp. 51-57, Feb, 2014. 916",
        "textItems": [
            [
                {
                    "text": "0",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.1418264438905259,
                        "width": 0.0039447785088894535,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 0,
                    "endIndex": 1
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.14577122239941537,
                        "width": 0.08313760046326794,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2,
                    "endIndex": 3
                },
                {
                    "text": "10",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.17347159956405547,
                        "width": 0.007757806557661135,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 4,
                    "endIndex": 6
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.18122940612171662,
                        "width": 0.07988628793633994,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 7,
                    "endIndex": 8
                },
                {
                    "text": "20",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.20784648784874285,
                        "width": 0.007757806557661135,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 9,
                    "endIndex": 11
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.21560429440640397,
                        "width": 0.07823598262588231,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 12,
                    "endIndex": 13
                },
                {
                    "text": "30",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.24167151566979217,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 14,
                    "endIndex": 16
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.24942932222745334,
                        "width": 0.07986996952130708,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 17,
                    "endIndex": 18
                },
                {
                    "text": "40",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.2760409668688694,
                        "width": 0.007757806557661135,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 19,
                    "endIndex": 21
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.2837987734265306,
                        "width": 0.0782522885572549,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 22,
                    "endIndex": 23
                },
                {
                    "text": "50",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.3098714276161342,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 24,
                    "endIndex": 26
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.31762923417379535,
                        "width": 0.07986996953764698,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 27,
                    "endIndex": 28
                },
                {
                    "text": "60",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.3442408788206557,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 29,
                    "endIndex": 31
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.35199868537831686,
                        "width": 0.07823598257686261,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 32,
                    "endIndex": 33
                },
                {
                    "text": "70",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.3780659066253723,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 34,
                    "endIndex": 36
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.3858237131830335,
                        "width": 0.07986991966836608,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 37,
                    "endIndex": 38
                },
                {
                    "text": "80",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.4124353412140921,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 39,
                    "endIndex": 41
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.42019314777175326,
                        "width": 0.07988632537098025,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 42,
                    "endIndex": 43
                },
                {
                    "text": "90",
                    "position": {
                        "top": 0.2822113513123373,
                        "left": 0.44681024197151925,
                        "width": 0.007757806557661182,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 44,
                    "endIndex": 46
                },
                {
                    "text": "0.2",
                    "position": {
                        "top": 0.27758952892996736,
                        "left": 0.13146334475872187,
                        "width": 0.009925800600604951,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 47,
                    "endIndex": 50
                }
            ],
            [
                {
                    "text": "0.25",
                    "position": {
                        "top": 0.23844201356190076,
                        "left": 0.12765020349519007,
                        "width": 0.013735775527356092,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 51,
                    "endIndex": 55
                }
            ],
            [
                {
                    "text": "0.3",
                    "position": {
                        "top": 0.199719329761876,
                        "left": 0.13146334475872187,
                        "width": 0.009925800600604951,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 56,
                    "endIndex": 59
                }
            ],
            [
                {
                    "text": "0.35",
                    "position": {
                        "top": 0.1605844358186409,
                        "left": 0.12765020349519007,
                        "width": 0.013735775527356092,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 60,
                    "endIndex": 64
                }
            ],
            [
                {
                    "text": "0.4",
                    "position": {
                        "top": 0.1218575416690433,
                        "left": 0.13146334475872187,
                        "width": 0.009925800600604951,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 65,
                    "endIndex": 68
                }
            ],
            [
                {
                    "text": "0.45",
                    "position": {
                        "top": 0.08313066035690343,
                        "left": 0.12765020349519007,
                        "width": 0.013735775527356092,
                        "height": 0.005481577366863395
                    },
                    "startIndex": 69,
                    "endIndex": 73
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.2914751829832612,
                        "left": 0.25913117773751976,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 74,
                    "endIndex": 74
                },
                {
                    "text": "missing rate (%)",
                    "position": {
                        "top": 0.2914751829832612,
                        "left": 0.25913117773751976,
                        "width": 0.07429305759784359,
                        "height": 0.008006585916510009
                    },
                    "startIndex": 75,
                    "endIndex": 91
                }
            ],
            [
                {
                    "text": "MRE of imputed data",
                    "position": {
                        "top": 0.2165569250948877,
                        "left": 0.12547142065720798,
                        "width": 0.09836501140668688,
                        "height": 0.00800784932071149
                    },
                    "startIndex": 92,
                    "endIndex": 111
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.09660745778356875,
                        "left": 0.17893216549069024,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 112,
                    "endIndex": 112
                },
                {
                    "text": "NN",
                    "position": {
                        "top": 0.09660745778356875,
                        "left": 0.17893216549069024,
                        "width": 0.01457668567224939,
                        "height": 0.008006585916510009
                    },
                    "startIndex": 113,
                    "endIndex": 115
                }
            ],
            [
                {
                    "text": "Deep learning",
                    "position": {
                        "top": 0.10711885812142011,
                        "left": 0.17893216549069024,
                        "width": 0.06407504186462099,
                        "height": 0.008006585916510009
                    },
                    "startIndex": 116,
                    "endIndex": 129
                }
            ],
            [
                {
                    "text": "Fig. 8.",
                    "position": {
                        "top": 0.32509851939393947,
                        "left": 0.1827156839869281,
                        "width": 0.03495383690405228,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 130,
                    "endIndex": 137
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.32509851939393947,
                        "left": 0.21766952089098043,
                        "width": 0.013674191039215702,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 138,
                    "endIndex": 139
                },
                {
                    "text": "The MRE of the imputed data",
                    "position": {
                        "top": 0.32509851939393947,
                        "left": 0.23134371193019612,
                        "width": 0.16241032042862755,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 140,
                    "endIndex": 167
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.36819069314393943,
                        "left": 0.08823529411764706,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 168,
                    "endIndex": 168
                },
                {
                    "text": "the statistical properties of the imputed data, we give the",
                    "position": {
                        "top": 0.36819069314393943,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 169,
                    "endIndex": 228
                }
            ],
            [
                {
                    "text": "distribution of the imputation error under the missing rate",
                    "position": {
                        "top": 0.3832853900126263,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 229,
                    "endIndex": 288
                }
            ],
            [
                {
                    "text": "of 0.3. Fig. 10 presents the empirical cumulative distribution",
                    "position": {
                        "top": 0.39838135,
                        "left": 0.08823529411764706,
                        "width": 0.4000016357140519,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 289,
                    "endIndex": 351
                }
            ],
            [
                {
                    "text": "of the absolute imputation error. 80% of the absolute error",
                    "position": {
                        "top": 0.41347604686868683,
                        "left": 0.08823529411764706,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 352,
                    "endIndex": 411
                }
            ],
            [
                {
                    "text": "are under 20 veh/5-minute and 95% of the absolute error",
                    "position": {
                        "top": 0.4285707437373737,
                        "left": 0.08823529411764706,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 412,
                    "endIndex": 467
                }
            ],
            [
                {
                    "text": "are under 40 veh/5-minute with the maximum flow to be",
                    "position": {
                        "top": 0.4436654406060605,
                        "left": 0.08823529411764706,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 468,
                    "endIndex": 521
                }
            ],
            [
                {
                    "text": "321 veh/5-minute. That illustrates our approach has a good",
                    "position": {
                        "top": 0.45876013747474736,
                        "left": 0.08823529411764706,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 522,
                    "endIndex": 580
                }
            ],
            [
                {
                    "text": "performance.",
                    "position": {
                        "top": 0.47385483434343423,
                        "left": 0.08823529411764706,
                        "width": 0.08632625240890524,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 581,
                    "endIndex": 593
                }
            ],
            [
                {
                    "text": "50",
                    "position": {
                        "top": 0.7310896199396297,
                        "left": 0.2001806247694981,
                        "width": 0.0077578065576611585,
                        "height": 0.005481959084623231
                    },
                    "startIndex": 594,
                    "endIndex": 596
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7310896199396297,
                        "left": 0.20793843132715928,
                        "width": 0.11428173024026132,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 597,
                    "endIndex": 598
                },
                {
                    "text": "100",
                    "position": {
                        "top": 0.7310896199396297,
                        "left": 0.24601563121076128,
                        "width": 0.011570834606432817,
                        "height": 0.005481959084623231
                    },
                    "startIndex": 599,
                    "endIndex": 602
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7310896199396297,
                        "left": 0.25758646581719413,
                        "width": 0.10770692506627455,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 603,
                    "endIndex": 604
                },
                {
                    "text": "150",
                    "position": {
                        "top": 0.7310896199396297,
                        "left": 0.2934730253396526,
                        "width": 0.01157083460643277,
                        "height": 0.005481959084623231
                    },
                    "startIndex": 605,
                    "endIndex": 608
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7310896199396297,
                        "left": 0.3050438599460854,
                        "width": 0.10775589281137257,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 609,
                    "endIndex": 610
                },
                {
                    "text": "200",
                    "position": {
                        "top": 0.7310896199396297,
                        "left": 0.340946734890213,
                        "width": 0.011570834606432817,
                        "height": 0.005481959084623231
                    },
                    "startIndex": 611,
                    "endIndex": 614
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7310896199396297,
                        "left": 0.3525175694966458,
                        "width": 0.10770692503359476,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 615,
                    "endIndex": 616
                },
                {
                    "text": "250",
                    "position": {
                        "top": 0.7310896199396297,
                        "left": 0.3884041290082158,
                        "width": 0.011570834606432864,
                        "height": 0.005481959084623231
                    },
                    "startIndex": 617,
                    "endIndex": 620
                },
                {
                    "text": "0",
                    "position": {
                        "top": 0.726457380752502,
                        "left": 0.15163058330842683,
                        "width": 0.0039447785088894535,
                        "height": 0.005481959084623231
                    },
                    "startIndex": 621,
                    "endIndex": 622
                }
            ],
            [
                {
                    "text": "50",
                    "position": {
                        "top": 0.6915326051231414,
                        "left": 0.14780437580189754,
                        "width": 0.007757806557661135,
                        "height": 0.005481959084623231
                    },
                    "startIndex": 623,
                    "endIndex": 625
                }
            ],
            [
                {
                    "text": "100",
                    "position": {
                        "top": 0.6570137619980556,
                        "left": 0.14399123349851708,
                        "width": 0.011570834606432817,
                        "height": 0.005481959084623231
                    },
                    "startIndex": 626,
                    "endIndex": 629
                }
            ],
            [
                {
                    "text": "150",
                    "position": {
                        "top": 0.6225075315563624,
                        "left": 0.14399123349851708,
                        "width": 0.011570834606432817,
                        "height": 0.005481959084623231
                    },
                    "startIndex": 630,
                    "endIndex": 633
                }
            ],
            [
                {
                    "text": "200",
                    "position": {
                        "top": 0.5875722453554049,
                        "left": 0.14399123349851708,
                        "width": 0.011570834606432817,
                        "height": 0.005481959084623231
                    },
                    "startIndex": 634,
                    "endIndex": 637
                }
            ],
            [
                {
                    "text": "250",
                    "position": {
                        "top": 0.5530660213244742,
                        "left": 0.14399123349851708,
                        "width": 0.011570834606432817,
                        "height": 0.005481959084623231
                    },
                    "startIndex": 638,
                    "endIndex": 641
                }
            ],
            [
                {
                    "text": "300",
                    "position": {
                        "top": 0.5185513888421553,
                        "left": 0.14399123349851708,
                        "width": 0.011570834606432817,
                        "height": 0.005481959084623231
                    },
                    "startIndex": 642,
                    "endIndex": 645
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.7424552623891434,
                        "left": 0.2683751037896247,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 646,
                    "endIndex": 646
                },
                {
                    "text": "time interval",
                    "position": {
                        "top": 0.7424552623891434,
                        "left": 0.2683751037896247,
                        "width": 0.05462389546634598,
                        "height": 0.008007143466980511
                    },
                    "startIndex": 647,
                    "endIndex": 660
                }
            ],
            [
                {
                    "text": "flow (veh/5-minute)",
                    "position": {
                        "top": 0.6544940439098152,
                        "left": 0.1341725577719621,
                        "width": 0.08895651400918853,
                        "height": 0.00800784932071149
                    },
                    "startIndex": 661,
                    "endIndex": 680
                }
            ],
            [
                {
                    "text": "Detector station 500010092",
                    "position": {
                        "top": 0.5122373724240168,
                        "left": 0.22745623988607996,
                        "width": 0.1288858637668269,
                        "height": 0.008007143466980511
                    },
                    "startIndex": 681,
                    "endIndex": 707
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5286554737067244,
                        "left": 0.37803830302842795,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 708,
                    "endIndex": 708
                },
                {
                    "text": "Observed",
                    "position": {
                        "top": 0.5286554737067244,
                        "left": 0.37803830302842795,
                        "width": 0.045535457537303065,
                        "height": 0.008007143466980511
                    },
                    "startIndex": 709,
                    "endIndex": 717
                }
            ],
            [
                {
                    "text": "Imputed",
                    "position": {
                        "top": 0.5391718295152466,
                        "left": 0.37803830302842795,
                        "width": 0.0378978534851884,
                        "height": 0.008007143466980511
                    },
                    "startIndex": 718,
                    "endIndex": 725
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.7707588311616163,
                        "left": 0.1610784343627451,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 726,
                    "endIndex": 726
                },
                {
                    "text": "Fig. 9.",
                    "position": {
                        "top": 0.7707588311616163,
                        "left": 0.1610784343627451,
                        "width": 0.03495383690405228,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 727,
                    "endIndex": 734
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7707588311616163,
                        "left": 0.19603227126679737,
                        "width": 0.013674191039215678,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 735,
                    "endIndex": 736
                },
                {
                    "text": "The imputed traffic data of one period",
                    "position": {
                        "top": 0.7707588311616163,
                        "left": 0.20970646230601306,
                        "width": 0.205685879307974,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 737,
                    "endIndex": 775
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.8094949433459596,
                        "left": 0.12504902385620917,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 776,
                    "endIndex": 776
                },
                {
                    "text": "V. CONCLUSIONS AND FUTURE WORKS",
                    "position": {
                        "top": 0.8094949433459596,
                        "left": 0.12504902385620917,
                        "width": 0.32637281435906845,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 777,
                    "endIndex": 808
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.8289065590025252,
                        "left": 0.08823529725490196,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 809,
                    "endIndex": 809
                },
                {
                    "text": "A. Conclusions",
                    "position": {
                        "top": 0.8289065590025252,
                        "left": 0.08823529725490196,
                        "width": 0.10265384644362743,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 810,
                    "endIndex": 824
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.8481704478282828,
                        "left": 0.10451470950980392,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 825,
                    "endIndex": 825
                },
                {
                    "text": "This paper proposes a deep learning based approach for",
                    "position": {
                        "top": 0.8481704478282828,
                        "left": 0.10451470950980392,
                        "width": 0.3837228779526141,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 826,
                    "endIndex": 880
                }
            ],
            [
                {
                    "text": "traffic data imputation. The imputation model is constructed",
                    "position": {
                        "top": 0.8632651446969696,
                        "left": 0.08823529725490196,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 881,
                    "endIndex": 941
                }
            ],
            [
                {
                    "text": "using a DAE filled with SAE in the middle layers. The",
                    "position": {
                        "top": 0.8783598415656566,
                        "left": 0.08823529725490196,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 942,
                    "endIndex": 995
                }
            ],
            [
                {
                    "text": "approach treats the traffic data including observed data and",
                    "position": {
                        "top": 0.8934545384343434,
                        "left": 0.08823529725490196,
                        "width": 0.40000163571405195,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 996,
                    "endIndex": 1056
                }
            ],
            [
                {
                    "text": "missing data as a whole data item and restores the complete",
                    "position": {
                        "top": 0.9085504984217172,
                        "left": 0.08823529725490196,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1057,
                    "endIndex": 1116
                }
            ],
            [
                {
                    "text": "data with a deep structural network. The deep learning",
                    "position": {
                        "top": 0.9236451952904041,
                        "left": 0.08823529725490196,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1117,
                    "endIndex": 1171
                }
            ],
            [
                {
                    "text": "0",
                    "position": {
                        "top": 0.29248978617470905,
                        "left": 0.5744289862156232,
                        "width": 0.0039447785088894535,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1172,
                    "endIndex": 1173
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.29248978617470905,
                        "left": 0.5783737647245126,
                        "width": 0.12078792074104569,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1174,
                    "endIndex": 1175
                },
                {
                    "text": "20",
                    "position": {
                        "top": 0.29248978617470905,
                        "left": 0.6186187434443147,
                        "width": 0.007757806557661182,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1176,
                    "endIndex": 1178
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.29248978617470905,
                        "left": 0.6263765500019759,
                        "width": 0.11588303046901943,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1179,
                    "endIndex": 1180
                },
                {
                    "text": "40",
                    "position": {
                        "top": 0.29248978617470905,
                        "left": 0.6649872824874723,
                        "width": 0.007757806557661182,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1181,
                    "endIndex": 1183
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.29248978617470905,
                        "left": 0.6727450890451334,
                        "width": 0.11588305535464061,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1184,
                    "endIndex": 1185
                },
                {
                    "text": "60",
                    "position": {
                        "top": 0.29248978617470905,
                        "left": 0.7113558298221981,
                        "width": 0.007757806557661089,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1186,
                    "endIndex": 1188
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.29248978617470905,
                        "left": 0.7191136363798594,
                        "width": 0.11591566731542462,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1189,
                    "endIndex": 1190
                },
                {
                    "text": "80",
                    "position": {
                        "top": 0.29248978617470905,
                        "left": 0.7577352430420201,
                        "width": 0.007757806557661182,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1191,
                    "endIndex": 1193
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.29248978617470905,
                        "left": 0.7654930495996812,
                        "width": 0.11098109460300644,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1194,
                    "endIndex": 1195
                },
                {
                    "text": "100",
                    "position": {
                        "top": 0.29248978617470905,
                        "left": 0.8024705202208853,
                        "width": 0.011570834606432726,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1196,
                    "endIndex": 1199
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.29248978617470905,
                        "left": 0.8140413548273181,
                        "width": 0.10443895119372552,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1200,
                    "endIndex": 1201
                },
                {
                    "text": "120",
                    "position": {
                        "top": 0.29248978617470905,
                        "left": 0.8488390675664996,
                        "width": 0.011570834606433097,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1202,
                    "endIndex": 1205
                },
                {
                    "text": "0",
                    "position": {
                        "top": 0.2878578101327797,
                        "left": 0.57005780911108,
                        "width": 0.0039447785088894535,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1206,
                    "endIndex": 1207
                }
            ],
            [
                {
                    "text": "0.1",
                    "position": {
                        "top": 0.26765790466711087,
                        "left": 0.5640522756824612,
                        "width": 0.009925800600604882,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1208,
                    "endIndex": 1211
                }
            ],
            [
                {
                    "text": "0.2",
                    "position": {
                        "top": 0.2478798918345074,
                        "left": 0.5640522756824612,
                        "width": 0.009925800600604882,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1212,
                    "endIndex": 1215
                }
            ],
            [
                {
                    "text": "0.3",
                    "position": {
                        "top": 0.22809346138734166,
                        "left": 0.5640522756824612,
                        "width": 0.009925800600604882,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1216,
                    "endIndex": 1219
                }
            ],
            [
                {
                    "text": "0.4",
                    "position": {
                        "top": 0.2078948219417251,
                        "left": 0.5640522756824612,
                        "width": 0.009925800600604882,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1220,
                    "endIndex": 1223
                }
            ],
            [
                {
                    "text": "0.5",
                    "position": {
                        "top": 0.18811679947249227,
                        "left": 0.5640522756824612,
                        "width": 0.009925800600604882,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1224,
                    "endIndex": 1227
                }
            ],
            [
                {
                    "text": "0.6",
                    "position": {
                        "top": 0.16833878984508807,
                        "left": 0.5640522756824612,
                        "width": 0.009925800600604882,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1228,
                    "endIndex": 1231
                }
            ],
            [
                {
                    "text": "0.7",
                    "position": {
                        "top": 0.1481401503952651,
                        "left": 0.5640522756824612,
                        "width": 0.009925800600604882,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1232,
                    "endIndex": 1235
                }
            ],
            [
                {
                    "text": "0.8",
                    "position": {
                        "top": 0.1283537199523058,
                        "left": 0.5640522756824612,
                        "width": 0.009925800600604882,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1236,
                    "endIndex": 1239
                }
            ],
            [
                {
                    "text": "0.9",
                    "position": {
                        "top": 0.1085757103164889,
                        "left": 0.5640522756824612,
                        "width": 0.009925800600604882,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1240,
                    "endIndex": 1243
                }
            ],
            [
                {
                    "text": "1",
                    "position": {
                        "top": 0.08879768785987503,
                        "left": 0.57005780911108,
                        "width": 0.0039447785088894535,
                        "height": 0.0054816476690956245
                    },
                    "startIndex": 1244,
                    "endIndex": 1245
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.3042745711859298,
                        "left": 0.6819025211662835,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1246,
                    "endIndex": 1246
                },
                {
                    "text": "absolute error",
                    "position": {
                        "top": 0.3042745711859298,
                        "left": 0.6819025211662835,
                        "width": 0.0639299584769283,
                        "height": 0.008006688602438675
                    },
                    "startIndex": 1247,
                    "endIndex": 1261
                }
            ],
            [
                {
                    "text": "cumulative probability",
                    "position": {
                        "top": 0.22135918024388276,
                        "left": 0.5542341440689738,
                        "width": 0.10102923296008096,
                        "height": 0.00800784932071149
                    },
                    "startIndex": 1262,
                    "endIndex": 1284
                }
            ],
            [
                {
                    "text": "Empirical CDF",
                    "position": {
                        "top": 0.08206340029760488,
                        "left": 0.6808082248301008,
                        "width": 0.06681090003254248,
                        "height": 0.008006688602438675
                    },
                    "startIndex": 1285,
                    "endIndex": 1298
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.3364747172727272,
                        "left": 0.5117647258169935,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1299,
                    "endIndex": 1299
                },
                {
                    "text": "Fig. 10.",
                    "position": {
                        "top": 0.3364747172727272,
                        "left": 0.5117647258169935,
                        "width": 0.04143931036836597,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1300,
                    "endIndex": 1308
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3364747172727272,
                        "left": 0.5532040361853595,
                        "width": 0.01360907584379083,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1309,
                    "endIndex": 1310
                },
                {
                    "text": "The empirical cumulative distribution of the absolute imputation",
                    "position": {
                        "top": 0.3364747172727272,
                        "left": 0.5668131120291504,
                        "width": 0.34495425928261414,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1311,
                    "endIndex": 1375
                }
            ],
            [
                {
                    "text": "error",
                    "position": {
                        "top": 0.3477966869696969,
                        "left": 0.5117647258169935,
                        "width": 0.025303764942091498,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1376,
                    "endIndex": 1381
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.5117647258169935,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1382,
                    "endIndex": 1382
                },
                {
                    "text": "approach",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.5117647258169935,
                        "width": 0.059661647195669944,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1383,
                    "endIndex": 1391
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.5714263730126632,
                        "width": 0.01007655105433003,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1392,
                    "endIndex": 1393
                },
                {
                    "text": "can",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.5815029240669932,
                        "width": 0.022594915772875816,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1394,
                    "endIndex": 1397
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.604097839839869,
                        "width": 0.010060272296568596,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1398,
                    "endIndex": 1399
                },
                {
                    "text": "discover",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.6141581121364377,
                        "width": 0.054664068562908466,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1400,
                    "endIndex": 1408
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.668822180699346,
                        "width": 0.01007655105433003,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1409,
                    "endIndex": 1410
                },
                {
                    "text": "the",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.678898731753676,
                        "width": 0.019892641984477124,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1411,
                    "endIndex": 1414
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.6987913737381531,
                        "width": 0.010060272296568596,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1415,
                    "endIndex": 1416
                },
                {
                    "text": "correlations",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.7088516460347217,
                        "width": 0.07685201539174837,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1417,
                    "endIndex": 1429
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.78570366142647,
                        "width": 0.01007655105433003,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1430,
                    "endIndex": 1431
                },
                {
                    "text": "contained",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.7957802124808,
                        "width": 0.06329181017647059,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1432,
                    "endIndex": 1441
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.8590720226572708,
                        "width": 0.010060272296568596,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1442,
                    "endIndex": 1443
                },
                {
                    "text": "in",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.8691322949538394,
                        "width": 0.012664873538398694,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1444,
                    "endIndex": 1446
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.881797168492238,
                        "width": 0.01007655105433003,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1447,
                    "endIndex": 1448
                },
                {
                    "text": "the",
                    "position": {
                        "top": 0.3895593134848484,
                        "left": 0.891873719546568,
                        "width": 0.019892641984477124,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1449,
                    "endIndex": 1452
                }
            ],
            [
                {
                    "text": "data structure by a layer-wise pre-training and improve the",
                    "position": {
                        "top": 0.40465401035353527,
                        "left": 0.5117647258169935,
                        "width": 0.40000163571405184,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1453,
                    "endIndex": 1512
                }
            ],
            [
                {
                    "text": "imputation accuracy by conducting a fine-tuning afterwards.",
                    "position": {
                        "top": 0.4197487072222221,
                        "left": 0.5117647258169935,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1513,
                    "endIndex": 1572
                }
            ],
            [
                {
                    "text": "We conduct a series of experiments using the data collected",
                    "position": {
                        "top": 0.43484340409090894,
                        "left": 0.5117647258169935,
                        "width": 0.4000016357140517,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1573,
                    "endIndex": 1632
                }
            ],
            [
                {
                    "text": "from Caltrans PeMS to evaluate the proposed approach. The",
                    "position": {
                        "top": 0.4499381009595958,
                        "left": 0.5117647258169935,
                        "width": 0.4000016357140521,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1633,
                    "endIndex": 1690
                }
            ],
            [
                {
                    "text": "results show that our approach is fairly good. Deep learning",
                    "position": {
                        "top": 0.4650340609469695,
                        "left": 0.5117647258169935,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1691,
                    "endIndex": 1751
                }
            ],
            [
                {
                    "text": "is promising in the field of traffic data imputation.",
                    "position": {
                        "top": 0.48012875781565634,
                        "left": 0.5117647258169935,
                        "width": 0.33773538727655184,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1752,
                    "endIndex": 1805
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5065529996085856,
                        "left": 0.5117647258169935,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1806,
                    "endIndex": 1806
                },
                {
                    "text": "B. Future Works",
                    "position": {
                        "top": 0.5065529996085856,
                        "left": 0.5117647258169935,
                        "width": 0.11165599948570255,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1807,
                    "endIndex": 1822
                }
            ],
            [
                {
                    "text": "",
                    "position": {
                        "top": 0.5267802729040402,
                        "left": 0.5280441380718954,
                        "width": 0,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1823,
                    "endIndex": 1823
                },
                {
                    "text": "There are still many works to do about the deep learning",
                    "position": {
                        "top": 0.5267802729040402,
                        "left": 0.5280441380718954,
                        "width": 0.3837228779526138,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1824,
                    "endIndex": 1880
                }
            ],
            [
                {
                    "text": "based traffic data imputation approach. As have been de-",
                    "position": {
                        "top": 0.541874969772727,
                        "left": 0.5117647258169935,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1881,
                    "endIndex": 1937
                }
            ],
            [
                {
                    "text": "scribed in the paper, the traffic data structures and imputation",
                    "position": {
                        "top": 0.5569696666414139,
                        "left": 0.5117647258169935,
                        "width": 0.4000016357140524,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 1938,
                    "endIndex": 2002
                }
            ],
            [
                {
                    "text": "patterns can be various in real practise. This paper only tests",
                    "position": {
                        "top": 0.5720643635101007,
                        "left": 0.5117647258169935,
                        "width": 0.40000163571405206,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2003,
                    "endIndex": 2066
                }
            ],
            [
                {
                    "text": "the performance of the approach in one pattern using one",
                    "position": {
                        "top": 0.5871590603787875,
                        "left": 0.5117647258169935,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2067,
                    "endIndex": 2123
                }
            ],
            [
                {
                    "text": "type of traffic data. More experiments are expected to be",
                    "position": {
                        "top": 0.6022550203661612,
                        "left": 0.5117647258169935,
                        "width": 0.400001635714052,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2124,
                    "endIndex": 2181
                }
            ],
            [
                {
                    "text": "done in the future. The architecture of the deep network in",
                    "position": {
                        "top": 0.6173497172348481,
                        "left": 0.5117647258169935,
                        "width": 0.4000016357140524,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2182,
                    "endIndex": 2241
                }
            ],
            [
                {
                    "text": "our approach is relatively simple. It can be more complex",
                    "position": {
                        "top": 0.6324444141035349,
                        "left": 0.5117647258169935,
                        "width": 0.40000163571405184,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2242,
                    "endIndex": 2299
                }
            ],
            [
                {
                    "text": "and powerful according to the need of applications. Large",
                    "position": {
                        "top": 0.6475391109722217,
                        "left": 0.5117647258169935,
                        "width": 0.40000163571405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2300,
                    "endIndex": 2357
                }
            ],
            [
                {
                    "text": "scale deep networks deserve to be investigated in the field",
                    "position": {
                        "top": 0.6626338078409086,
                        "left": 0.5117647258169935,
                        "width": 0.4000016357140523,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2358,
                    "endIndex": 2417
                }
            ],
            [
                {
                    "text": "of traffic data imputation.",
                    "position": {
                        "top": 0.6777285047095954,
                        "left": 0.5117647258169935,
                        "width": 0.17086184146405223,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2418,
                    "endIndex": 2445
                }
            ],
            [
                {
                    "text": "VI. ACKNOWLEDGMENTS",
                    "position": {
                        "top": 0.704154010833333,
                        "left": 0.6048627678594771,
                        "width": 0.21380520443872605,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2446,
                    "endIndex": 2465
                }
            ],
            [
                {
                    "text": "The authors would like to thank Prof. F.-Y. Wang for his",
                    "position": {
                        "top": 0.725215879204545,
                        "left": 0.528044139624183,
                        "width": 0.38372287795261434,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2466,
                    "endIndex": 2522
                }
            ],
            [
                {
                    "text": "instruction and encouragement.",
                    "position": {
                        "top": 0.7403105760732318,
                        "left": 0.511764727369281,
                        "width": 0.2080588029489379,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2523,
                    "endIndex": 2553
                }
            ],
            [
                {
                    "text": "R",
                    "position": {
                        "top": 0.7667360821969693,
                        "left": 0.6661846575163398,
                        "width": 0.010857931426879085,
                        "height": 0.01257904008838384
                    },
                    "startIndex": 2554,
                    "endIndex": 2555
                },
                {
                    "text": "EFERENCES",
                    "position": {
                        "top": 0.7667360821969693,
                        "left": 0.6778562263235294,
                        "width": 0.07950565361372558,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2556,
                    "endIndex": 2565
                }
            ],
            [
                {
                    "text": "[1]",
                    "position": {
                        "top": 0.7874191636363631,
                        "left": 0.5182761576960784,
                        "width": 0.015184863573071892,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2566,
                    "endIndex": 2569
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.7874191636363631,
                        "left": 0.5334610212691504,
                        "width": 0.008139399428104606,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2570,
                    "endIndex": 2571
                },
                {
                    "text": "F.-Y. Wang, Parallel control and management for intelligent trans-",
                    "position": {
                        "top": 0.7874191636363631,
                        "left": 0.541600420697255,
                        "width": 0.3701668629511112,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2572,
                    "endIndex": 2638
                }
            ],
            [
                {
                    "text": "portation systems: Concepts, architectures, and applications, Intelligent",
                    "position": {
                        "top": 0.7987411333333329,
                        "left": 0.5415996873529412,
                        "width": 0.37016686295111095,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2639,
                    "endIndex": 2712
                }
            ],
            [
                {
                    "text": "Transportation Systems, IEEE Transactions on, vol. 11, no. 3, pp. 630-",
                    "position": {
                        "top": 0.8100618398989894,
                        "left": 0.5415996873529412,
                        "width": 0.3701668629511112,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2713,
                    "endIndex": 2783
                }
            ],
            [
                {
                    "text": "638, 2010.",
                    "position": {
                        "top": 0.8213838095959592,
                        "left": 0.5415996873529412,
                        "width": 0.056650220019607844,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2784,
                    "endIndex": 2794
                }
            ],
            [
                {
                    "text": "[2]",
                    "position": {
                        "top": 0.8328901226010097,
                        "left": 0.5182761576960784,
                        "width": 0.015184863573071892,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2795,
                    "endIndex": 2798
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.8328901226010097,
                        "left": 0.5334610212691504,
                        "width": 0.008139399428104606,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2799,
                    "endIndex": 2800
                },
                {
                    "text": "B. L. Smith, W. T. Scherer, J. H. Conklin et al., ”Exploring imputation",
                    "position": {
                        "top": 0.8328901226010097,
                        "left": 0.541600420697255,
                        "width": 0.3701668629511111,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2801,
                    "endIndex": 2872
                }
            ],
            [
                {
                    "text": "techniques for missing data in transportation management systems,”",
                    "position": {
                        "top": 0.8442108291666663,
                        "left": 0.5415996873529412,
                        "width": 0.3701668629511109,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2873,
                    "endIndex": 2939
                }
            ],
            [
                {
                    "text": "Initiatives",
                    "position": {
                        "top": 0.855532798863636,
                        "left": 0.5415996873529412,
                        "width": 0.05157123477647058,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2940,
                    "endIndex": 2951
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.855532798863636,
                        "left": 0.5931709221294121,
                        "width": 0.007826846490065334,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2952,
                    "endIndex": 2953
                },
                {
                    "text": "in Information",
                    "position": {
                        "top": 0.855532798863636,
                        "left": 0.6009977686194774,
                        "width": 0.08015680556797383,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2954,
                    "endIndex": 2968
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.855532798863636,
                        "left": 0.6811545741874516,
                        "width": 0.007826846490065334,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2969,
                    "endIndex": 2970
                },
                {
                    "text": "Technology",
                    "position": {
                        "top": 0.855532798863636,
                        "left": 0.688981420677517,
                        "width": 0.061299444972941146,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2971,
                    "endIndex": 2981
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.855532798863636,
                        "left": 0.7502808656504585,
                        "width": 0.007826846490065334,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2982,
                    "endIndex": 2983
                },
                {
                    "text": "and",
                    "position": {
                        "top": 0.855532798863636,
                        "left": 0.7581077121405237,
                        "width": 0.018805268438692808,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2984,
                    "endIndex": 2987
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.855532798863636,
                        "left": 0.7769129805792168,
                        "width": 0.007826846490065334,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 2988,
                    "endIndex": 2989
                },
                {
                    "text": "Geospatial",
                    "position": {
                        "top": 0.855532798863636,
                        "left": 0.784739827069282,
                        "width": 0.05568651512732028,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 2990,
                    "endIndex": 3000
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.855532798863636,
                        "left": 0.8404263421966025,
                        "width": 0.007826846490065334,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3001,
                    "endIndex": 3002
                },
                {
                    "text": "Science",
                    "position": {
                        "top": 0.855532798863636,
                        "left": 0.8482531886866679,
                        "width": 0.04050165155424837,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3003,
                    "endIndex": 3010
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.855532798863636,
                        "left": 0.8887548402409162,
                        "width": 0.007826846490065334,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3011,
                    "endIndex": 3012
                },
                {
                    "text": "for",
                    "position": {
                        "top": 0.855532798863636,
                        "left": 0.8965816867309816,
                        "width": 0.015184863573071892,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3013,
                    "endIndex": 3016
                }
            ],
            [
                {
                    "text": "Transportation: Planning and Administration, Transportation Research",
                    "position": {
                        "top": 0.8668535054292924,
                        "left": 0.5415996873529412,
                        "width": 0.37016686295111095,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3017,
                    "endIndex": 3085
                }
            ],
            [
                {
                    "text": "Record",
                    "position": {
                        "top": 0.878174211994949,
                        "left": 0.5415996873529412,
                        "width": 0.037610536877385616,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3086,
                    "endIndex": 3092
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.878174211994949,
                        "left": 0.5792102242303269,
                        "width": 0.00847799844431377,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3093,
                    "endIndex": 3094
                },
                {
                    "text": "1836,",
                    "position": {
                        "top": 0.878174211994949,
                        "left": 0.5876882226746406,
                        "width": 0.029301837941176467,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3095,
                    "endIndex": 3100
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.878174211994949,
                        "left": 0.6169900606158173,
                        "width": 0.00846497540522873,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3101,
                    "endIndex": 3102
                },
                {
                    "text": "pp.",
                    "position": {
                        "top": 0.878174211994949,
                        "left": 0.625455036021046,
                        "width": 0.016278798856209146,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3103,
                    "endIndex": 3106
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.878174211994949,
                        "left": 0.6417338348772552,
                        "width": 0.00847799844431377,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3107,
                    "endIndex": 3108
                },
                {
                    "text": "132-142,",
                    "position": {
                        "top": 0.878174211994949,
                        "left": 0.650211833321569,
                        "width": 0.0466615490414379,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3109,
                    "endIndex": 3117
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.878174211994949,
                        "left": 0.6968733823630071,
                        "width": 0.00847799844431377,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3118,
                    "endIndex": 3119
                },
                {
                    "text": "Washington:",
                    "position": {
                        "top": 0.878174211994949,
                        "left": 0.7053513808073208,
                        "width": 0.06551890963647058,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3120,
                    "endIndex": 3131
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.878174211994949,
                        "left": 0.7708702904437919,
                        "width": 0.00846497540522873,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3132,
                    "endIndex": 3133
                },
                {
                    "text": "Transportation",
                    "position": {
                        "top": 0.878174211994949,
                        "left": 0.7793352658490206,
                        "width": 0.0762238477643137,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3134,
                    "endIndex": 3148
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.878174211994949,
                        "left": 0.8555591136133345,
                        "width": 0.00847799844431377,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3149,
                    "endIndex": 3150
                },
                {
                    "text": "Research",
                    "position": {
                        "top": 0.878174211994949,
                        "left": 0.8640371120576482,
                        "width": 0.04772943824640523,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3151,
                    "endIndex": 3159
                }
            ],
            [
                {
                    "text": "Board Natl Research Council, 2003.",
                    "position": {
                        "top": 0.8894961816919187,
                        "left": 0.5415996873529412,
                        "width": 0.19401723628784318,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3160,
                    "endIndex": 3194
                }
            ],
            [
                {
                    "text": "[3]",
                    "position": {
                        "top": 0.9010024946969694,
                        "left": 0.5182761576960784,
                        "width": 0.015184863573071892,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3195,
                    "endIndex": 3198
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.9010024946969694,
                        "left": 0.5334610212691504,
                        "width": 0.008139399428104606,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 3199,
                    "endIndex": 3200
                },
                {
                    "text": "Y. B. Li, Z. H. Li, and L. Li, Missing traffic data: comparison of",
                    "position": {
                        "top": 0.9010024946969694,
                        "left": 0.541600420697255,
                        "width": 0.3701668629511108,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3201,
                    "endIndex": 3267
                }
            ],
            [
                {
                    "text": "imputation methods, Iet Intelligent Transport Systems, vol. 8, no. 1,",
                    "position": {
                        "top": 0.9123232012626258,
                        "left": 0.5415996873529412,
                        "width": 0.370166862951111,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3268,
                    "endIndex": 3337
                }
            ],
            [
                {
                    "text": "pp. 51-57, Feb, 2014.",
                    "position": {
                        "top": 0.9236451709595955,
                        "left": 0.5415996873529412,
                        "width": 0.11568365619176474,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 3338,
                    "endIndex": 3359
                }
            ],
            [
                {
                    "text": "916",
                    "position": {
                        "top": 0.954040404040404,
                        "left": 0.48909803921568623,
                        "width": 0.021803921568627455,
                        "height": 0.010101010101010102
                    },
                    "startIndex": 3360,
                    "endIndex": 3363
                }
            ]
        ],
        "page": 5
    },
    {
        "id": "page_6",
        "block_type": "Page",
        "text": "[4]   P. Vincent, H. Larochelle, Y. Bengio et al., ”Extracting and composing robust features with denoising autoencoders.” in Proceedings of the 25th International Conference on Machine Learning, Helsinki, Finland, pp. 1096-1103, 2008. [5]   Y. Bengio, P. Lamblin, D. Popovici et al., Greedy layer-wise training of deep networks, Advances in neural information processing systems, vol. 19, pp. 153, 2007. [6]   N. L. Nihan, Aid to determining freeway metering rates and detecting loop errors, Journal of Transportation Engineering-Asce, vol. 123, no. 6, pp. 454-458, Nov-Dec, 1997. [7]   Z. B. Liu, S. Sharma, and S. Datla, Imputation of missing traffic data during holiday periods, Transportation Planning and Technology, vol. 31, no. 5, pp. 525-544, 2008. [8]   D. H. Ni, J. D. Leonard, and Trb, ”Markov chain Monte Carlo mul- tiple imputation using Bayesian networks for incomplete intelligent transportation systems data,” Information Systems and Technology, Transportation Research Record 1935, pp. 57-67, Washington: Trans- portation Research Board Natl Research Council, 2005. [9]   D. H. Ni, J. D. Leonard, A. Guin et al., Multiple imputation scheme for overcoming the missing values and variability issues in ITS data, Journal of Transportation Engineering-Asce, vol. 131, no. 12, pp. 931- 938, Dec, 2005. [10]   M. Zhong, S. Sharma, P. Lingras et al., ”Genetically designed models for accurate imputation of missing traffic counts,” Information Systems and Technology, Transportation Research Record-Series 1879, pp. 71-79, Washington: Transportation Research Board Natl Research Council, 2004. [11]   G. E. Hinton, and R. R. Salakhutdinov, Reducing the dimensionality of data with neural networks, Science, vol. 313, no. 5786, pp. 504-507, Jul, 2006. [12]   G. E. Hinton, S. Osindero, and Y. W. Teh, A fast learning algorithm for deep belief nets, Neural Computation, vol. 18, no. 7, pp. 1527-1554, Jul, 2006. 917",
        "textItems": [
            [
                {
                    "text": "[4]",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.09474673302287581,
                        "width": 0.015184863573071892,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 0,
                    "endIndex": 3
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.10993159659594771,
                        "width": 0.008139399428104582,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 4,
                    "endIndex": 5
                },
                {
                    "text": "P. Vincent, H. Larochelle, Y. Bengio et al., ”Extracting and composing",
                    "position": {
                        "top": 0.07832952941919187,
                        "left": 0.1180709960240523,
                        "width": 0.37016686295111106,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 6,
                    "endIndex": 76
                }
            ],
            [
                {
                    "text": "robust features with denoising autoencoders.” in Proceedings of the",
                    "position": {
                        "top": 0.08965149911616155,
                        "left": 0.11807026267973857,
                        "width": 0.37016686295111095,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 77,
                    "endIndex": 144
                }
            ],
            [
                {
                    "text": "25th International Conference on Machine Learning, Helsinki, Finland,",
                    "position": {
                        "top": 0.10097220568181815,
                        "left": 0.11807026267973857,
                        "width": 0.37016686295111106,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 145,
                    "endIndex": 214
                }
            ],
            [
                {
                    "text": "pp. 1096-1103, 2008.",
                    "position": {
                        "top": 0.11229291224747476,
                        "left": 0.11807026267973857,
                        "width": 0.11438135228326794,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 215,
                    "endIndex": 235
                }
            ],
            [
                {
                    "text": "[5]",
                    "position": {
                        "top": 0.12361488194444444,
                        "left": 0.09474673302287583,
                        "width": 0.015184863573071892,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 236,
                    "endIndex": 239
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.12361488194444444,
                        "left": 0.10993159659594774,
                        "width": 0.008139399428104582,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 240,
                    "endIndex": 241
                },
                {
                    "text": "Y. Bengio, P. Lamblin, D. Popovici et al., Greedy layer-wise training",
                    "position": {
                        "top": 0.12361488194444444,
                        "left": 0.11807099602405233,
                        "width": 0.3701668629511111,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 242,
                    "endIndex": 311
                }
            ],
            [
                {
                    "text": "of deep networks, Advances in neural information processing systems,",
                    "position": {
                        "top": 0.13493558851010104,
                        "left": 0.11807026267973857,
                        "width": 0.370166862951111,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 312,
                    "endIndex": 380
                }
            ],
            [
                {
                    "text": "vol. 19, pp. 153, 2007.",
                    "position": {
                        "top": 0.14625755820707073,
                        "left": 0.11807026267973857,
                        "width": 0.12252075171137253,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 381,
                    "endIndex": 404
                }
            ],
            [
                {
                    "text": "[6]",
                    "position": {
                        "top": 0.15757826477272732,
                        "left": 0.09474673302287583,
                        "width": 0.015184863573071892,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 405,
                    "endIndex": 408
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.15757826477272732,
                        "left": 0.10993159659594774,
                        "width": 0.008139399428104582,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 409,
                    "endIndex": 410
                },
                {
                    "text": "N. L. Nihan, Aid to determining freeway metering rates and detecting",
                    "position": {
                        "top": 0.15757826477272732,
                        "left": 0.11807099602405233,
                        "width": 0.37016686295111106,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 411,
                    "endIndex": 479
                }
            ],
            [
                {
                    "text": "loop errors, Journal of Transportation Engineering-Asce, vol. 123, no.",
                    "position": {
                        "top": 0.16889897133838394,
                        "left": 0.11807026267973857,
                        "width": 0.370166862951111,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 480,
                    "endIndex": 550
                }
            ],
            [
                {
                    "text": "6, pp. 454-458, Nov-Dec, 1997.",
                    "position": {
                        "top": 0.1802209410353536,
                        "left": 0.11807026267973857,
                        "width": 0.1710315723028758,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 551,
                    "endIndex": 581
                }
            ],
            [
                {
                    "text": "[7]",
                    "position": {
                        "top": 0.19154164760101022,
                        "left": 0.09474673302287583,
                        "width": 0.015184863573071892,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 582,
                    "endIndex": 585
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.19154164760101022,
                        "left": 0.10993159659594774,
                        "width": 0.008139399428104582,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 586,
                    "endIndex": 587
                },
                {
                    "text": "Z. B. Liu, S. Sharma, and S. Datla, Imputation of missing traffic data",
                    "position": {
                        "top": 0.19154164760101022,
                        "left": 0.11807099602405233,
                        "width": 0.370166862951111,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 588,
                    "endIndex": 658
                }
            ],
            [
                {
                    "text": "during holiday periods, Transportation Planning and Technology, vol.",
                    "position": {
                        "top": 0.20286235416666681,
                        "left": 0.11807026267973857,
                        "width": 0.37016686295111084,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 659,
                    "endIndex": 727
                }
            ],
            [
                {
                    "text": "31, no. 5, pp. 525-544, 2008.",
                    "position": {
                        "top": 0.2141843238636365,
                        "left": 0.11807026267973857,
                        "width": 0.15735738126366008,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 728,
                    "endIndex": 757
                }
            ],
            [
                {
                    "text": "[8]",
                    "position": {
                        "top": 0.2255050304292931,
                        "left": 0.09474673302287583,
                        "width": 0.015184863573071892,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 758,
                    "endIndex": 761
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2255050304292931,
                        "left": 0.10993159659594774,
                        "width": 0.008139399428104582,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 762,
                    "endIndex": 763
                },
                {
                    "text": "D. H. Ni, J. D. Leonard, and Trb, ”Markov chain Monte Carlo mul-",
                    "position": {
                        "top": 0.2255050304292931,
                        "left": 0.11807099602405233,
                        "width": 0.37016686295111095,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 764,
                    "endIndex": 828
                }
            ],
            [
                {
                    "text": "tiple imputation using Bayesian networks for incomplete intelligent",
                    "position": {
                        "top": 0.2368270001262628,
                        "left": 0.11807026267973857,
                        "width": 0.37016686295111106,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 829,
                    "endIndex": 896
                }
            ],
            [
                {
                    "text": "transportation systems data,” Information Systems and Technology,",
                    "position": {
                        "top": 0.2481477066919194,
                        "left": 0.11807026267973857,
                        "width": 0.3701668629511109,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 897,
                    "endIndex": 962
                }
            ],
            [
                {
                    "text": "Transportation Research Record 1935, pp. 57-67, Washington: Trans-",
                    "position": {
                        "top": 0.259468413257576,
                        "left": 0.11807026267973857,
                        "width": 0.37016686295111106,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 963,
                    "endIndex": 1029
                }
            ],
            [
                {
                    "text": "portation Research Board Natl Research Council, 2005.",
                    "position": {
                        "top": 0.27079038295454566,
                        "left": 0.11807026267973857,
                        "width": 0.29788899602954255,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1030,
                    "endIndex": 1083
                }
            ],
            [
                {
                    "text": "[9]",
                    "position": {
                        "top": 0.2821110895202023,
                        "left": 0.09474673302287583,
                        "width": 0.015184863573071892,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1084,
                    "endIndex": 1087
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.2821110895202023,
                        "left": 0.10993159659594774,
                        "width": 0.008139399428104582,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1088,
                    "endIndex": 1089
                },
                {
                    "text": "D. H. Ni, J. D. Leonard, A. Guin et al., Multiple imputation scheme",
                    "position": {
                        "top": 0.2821110895202023,
                        "left": 0.11807099602405233,
                        "width": 0.37016686295111095,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1090,
                    "endIndex": 1157
                }
            ],
            [
                {
                    "text": "for overcoming the missing values and variability issues in ITS data,",
                    "position": {
                        "top": 0.2934317960858589,
                        "left": 0.11807026267973857,
                        "width": 0.37016686295111095,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1158,
                    "endIndex": 1227
                }
            ],
            [
                {
                    "text": "Journal of Transportation Engineering-Asce, vol. 131, no. 12, pp. 931-",
                    "position": {
                        "top": 0.3047537657828286,
                        "left": 0.11807026267973857,
                        "width": 0.37016686295111106,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1228,
                    "endIndex": 1298
                }
            ],
            [
                {
                    "text": "938, Dec, 2005.",
                    "position": {
                        "top": 0.3160744723484852,
                        "left": 0.11807026267973857,
                        "width": 0.0854311363973856,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1299,
                    "endIndex": 1314
                }
            ],
            [
                {
                    "text": "[10]",
                    "position": {
                        "top": 0.32739644204545487,
                        "left": 0.0882352941013072,
                        "width": 0.02169638311555555,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1315,
                    "endIndex": 1319
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.32739644204545487,
                        "left": 0.10993167721686276,
                        "width": 0.008139399428104582,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1320,
                    "endIndex": 1321
                },
                {
                    "text": "M. Zhong, S. Sharma, P. Lingras et al., ”Genetically designed models",
                    "position": {
                        "top": 0.32739644204545487,
                        "left": 0.11807107664496734,
                        "width": 0.3701668629511109,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1322,
                    "endIndex": 1390
                }
            ],
            [
                {
                    "text": "for accurate imputation of missing traffic counts,” Information Systems",
                    "position": {
                        "top": 0.33871714861111146,
                        "left": 0.11807026267973857,
                        "width": 0.37016686295111095,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1391,
                    "endIndex": 1462
                }
            ],
            [
                {
                    "text": "and Technology, Transportation Research Record-Series 1879, pp.",
                    "position": {
                        "top": 0.35003785517676805,
                        "left": 0.11807026267973857,
                        "width": 0.3701668629511111,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1463,
                    "endIndex": 1526
                }
            ],
            [
                {
                    "text": "71-79, Washington: Transportation Research Board Natl Research",
                    "position": {
                        "top": 0.36135982487373774,
                        "left": 0.11807026267973857,
                        "width": 0.3701668629511111,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1527,
                    "endIndex": 1589
                }
            ],
            [
                {
                    "text": "Council, 2004.",
                    "position": {
                        "top": 0.3726805314393943,
                        "left": 0.11807026267973857,
                        "width": 0.07835962617424835,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1590,
                    "endIndex": 1604
                }
            ],
            [
                {
                    "text": "[11]",
                    "position": {
                        "top": 0.3840012380050508,
                        "left": 0.0882352941013072,
                        "width": 0.02169638311555555,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1605,
                    "endIndex": 1609
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.3840012380050508,
                        "left": 0.10993167721686276,
                        "width": 0.008139399428104582,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1610,
                    "endIndex": 1611
                },
                {
                    "text": "G. E. Hinton, and R. R. Salakhutdinov, Reducing the dimensionality",
                    "position": {
                        "top": 0.3840012380050508,
                        "left": 0.11807107664496734,
                        "width": 0.370166862951111,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1612,
                    "endIndex": 1678
                }
            ],
            [
                {
                    "text": "of data with neural networks, Science, vol. 313, no. 5786, pp. 504-507,",
                    "position": {
                        "top": 0.3953232077020205,
                        "left": 0.11807026267973857,
                        "width": 0.3701668629511111,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1679,
                    "endIndex": 1750
                }
            ],
            [
                {
                    "text": "Jul, 2006.",
                    "position": {
                        "top": 0.40664391426767704,
                        "left": 0.11807026267973857,
                        "width": 0.05231354800431371,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1751,
                    "endIndex": 1761
                }
            ],
            [
                {
                    "text": "[12]",
                    "position": {
                        "top": 0.4179646208333336,
                        "left": 0.0882352941013072,
                        "width": 0.02169638311555555,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1762,
                    "endIndex": 1766
                },
                {
                    "text": " ",
                    "position": {
                        "top": 0.4179646208333336,
                        "left": 0.10993167721686276,
                        "width": 0.008139399428104582,
                        "height": 0.015151515151515152
                    },
                    "startIndex": 1767,
                    "endIndex": 1768
                },
                {
                    "text": "G. E. Hinton, S. Osindero, and Y. W. Teh, A fast learning algorithm for",
                    "position": {
                        "top": 0.4179646208333336,
                        "left": 0.11807107664496734,
                        "width": 0.3701668629511111,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1769,
                    "endIndex": 1840
                }
            ],
            [
                {
                    "text": "deep belief nets, Neural Computation, vol. 18, no. 7, pp. 1527-1554,",
                    "position": {
                        "top": 0.4292865905303032,
                        "left": 0.11807026267973857,
                        "width": 0.3701668629511112,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1841,
                    "endIndex": 1909
                }
            ],
            [
                {
                    "text": "Jul, 2006.",
                    "position": {
                        "top": 0.44060729709595975,
                        "left": 0.11807026267973857,
                        "width": 0.05231354800431371,
                        "height": 0.010063257474747475
                    },
                    "startIndex": 1910,
                    "endIndex": 1920
                }
            ],
            [
                {
                    "text": "917",
                    "position": {
                        "top": 0.954040404040404,
                        "left": 0.48909803921568623,
                        "width": 0.021803921568627455,
                        "height": 0.010101010101010102
                    },
                    "startIndex": 1921,
                    "endIndex": 1924
                }
            ]
        ],
        "page": 6
    }
]

export default textItems;